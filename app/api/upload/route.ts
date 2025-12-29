import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// Configuration
const OCR_API_URL = process.env.OCR_API_URL || 'https://external8-cv-profiler-ocr.hf.space/api/predict';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Vercel: augmenter le timeout à 60 secondes
export const maxDuration = 60;

// Fonction pour nettoyer le texte (supprimer caractères null et autres invalides pour PostgreSQL)
function cleanText(text: string): string {
    if (!text) return '';
    // Supprimer les caractères null (\u0000) et autres caractères de contrôle
    return text
        .replace(/\u0000/g, '') // Supprimer null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Supprimer autres caractères de contrôle
        .trim();
}

// POST - Upload de CVs avec OCR + AI
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
        }

        const uploadResults = [];

        for (const file of files) {
            // Créer un enregistrement de statut d'upload
            const { data: uploadStatus, error: statusError } = await supabase
                .from('upload_status')
                .insert({
                    filename: file.name,
                    status: 'processing',
                    progress: 0,
                    user_id: user.userId,
                })
                .select()
                .single();

            if (statusError) {
                console.error('Error creating upload status:', statusError);
                continue;
            }

            try {
                // Lire le contenu du fichier
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString('base64');

                // Mettre à jour le statut à 20%
                await supabase
                    .from('upload_status')
                    .update({ progress: 20 })
                    .eq('id', uploadStatus.id);

                // === ÉTAPE 1: OCR avec PaddleOCR (HuggingFace) ===
                let extractedText = '';

                try {
                    const ocrResponse = await fetch(OCR_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            data: [`data:${file.type};base64,${base64}`]
                        }),
                    });

                    if (ocrResponse.ok) {
                        const ocrData = await ocrResponse.json();
                        // Le format Gradio retourne généralement { data: [result] }
                        extractedText = ocrData.data?.[0] || '';
                        console.log('OCR extracted text length:', extractedText.length);
                    } else {
                        console.error('OCR API error:', await ocrResponse.text());
                        // Fallback: extraction basique pour les PDFs
                        extractedText = await extractTextFromPDF(buffer);
                    }
                } catch (ocrError) {
                    console.error('OCR service error:', ocrError);
                    // Fallback
                    extractedText = await extractTextFromPDF(buffer);
                }

                // Nettoyer le texte (supprimer caractères null et invalides)
                extractedText = cleanText(extractedText);

                // Mettre à jour le statut à 50%
                await supabase
                    .from('upload_status')
                    .update({ progress: 50 })
                    .eq('id', uploadStatus.id);

                // === ÉTAPE 2: Analyse IA avec Groq/Llama-3 ===
                const candidateData = await analyzeWithGroq(extractedText);

                // Mettre à jour le statut à 80%
                await supabase
                    .from('upload_status')
                    .update({ progress: 80 })
                    .eq('id', uploadStatus.id);

                // === ÉTAPE 3: Créer le candidat dans Supabase ===
                const { data: candidate, error: candidateError } = await supabase
                    .from('candidates')
                    .insert({
                        ...candidateData,
                        cv_text: extractedText,
                        user_id: user.userId,
                    })
                    .select()
                    .single();

                if (candidateError) {
                    throw candidateError;
                }

                // Mettre à jour le statut comme terminé
                await supabase
                    .from('upload_status')
                    .update({
                        status: 'completed',
                        progress: 100,
                        candidate_id: candidate.id,
                    })
                    .eq('id', uploadStatus.id);

                uploadResults.push({
                    id: uploadStatus.id,
                    filename: file.name,
                    status: 'completed',
                    candidate_id: candidate.id,
                    candidate_name: candidateData.name,
                });

            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);

                await supabase
                    .from('upload_status')
                    .update({
                        status: 'error',
                        error: error instanceof Error ? error.message : 'Erreur inconnue',
                    })
                    .eq('id', uploadStatus.id);

                uploadResults.push({
                    id: uploadStatus.id,
                    filename: file.name,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Erreur inconnue',
                });
            }
        }

        return NextResponse.json({
            success: true,
            results: uploadResults,
        });

    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Analyse avec Groq/Llama-3
async function analyzeWithGroq(text: string): Promise<{
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: object[];
    education: object[];
    psychological_profile: object | null;
}> {
    if (!GROQ_API_KEY || !text || text.length < 10) {
        return fallbackParsing(text);
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert en analyse de CV. Extrais les informations du CV suivant et retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{
  "name": "Nom complet du candidat",
  "email": "email@example.com",
  "phone": "+33...",
  "skills": ["Skill1", "Skill2", ...],
  "experience": [
    {
      "title": "Titre du poste",
      "company": "Nom entreprise",
      "startDate": "2020",
      "endDate": "2023",
      "description": "Description courte"
    }
  ],
  "education": [
    {
      "degree": "Diplôme",
      "school": "École/Université",
      "year": "2020"
    }
  ],
  "psychological_profile": {
    "personalityType": "Analytique/Créatif/Leader/etc",
    "communicationStyle": "Direct/Collaboratif/etc",
    "strengths": ["Force1", "Force2"],
    "workStyle": "Autonome/Équipe/etc"
  }
}

Si une information n'est pas trouvée, utilise une valeur vide ou un tableau vide.
Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`
                    },
                    {
                        role: 'user',
                        content: `Analyse ce CV:\n\n${text.substring(0, 8000)}`
                    }
                ],
                temperature: 0.1,
                max_tokens: 2000,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            // Extraire le JSON de la réponse
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    name: parsed.name || 'Candidat Importé',
                    email: parsed.email || '',
                    phone: parsed.phone || '',
                    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
                    education: Array.isArray(parsed.education) ? parsed.education : [],
                    psychological_profile: parsed.psychological_profile || null,
                };
            }
        }
    } catch (error) {
        console.error('Groq API error:', error);
    }

    return fallbackParsing(text);
}

// Fallback si Groq échoue
function fallbackParsing(text: string): {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: object[];
    education: object[];
    psychological_profile: null;
} {
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/);

    const lines = text.split('\n').filter(l => l.trim());
    let name = 'Candidat Importé';

    for (const line of lines.slice(0, 5)) {
        const cleaned = line.trim();
        if (cleaned && !cleaned.includes('@') && !cleaned.match(/^\d/) && cleaned.length < 50) {
            name = cleaned;
            break;
        }
    }

    const skillKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift', 'PHP',
        'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Supabase', 'Firebase',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
        'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'Figma', 'Adobe XD',
        'REST', 'GraphQL', 'API', 'Microservices', 'WebSocket',
        'Agile', 'Scrum', 'Jira', 'Confluence', 'Trello',
        'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
        'Linux', 'DevOps', 'Terraform', 'Ansible', 'Nginx', 'Apache'
    ];

    const foundSkills = skillKeywords.filter(skill =>
        text.toLowerCase().includes(skill.toLowerCase())
    );

    return {
        name,
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        skills: foundSkills.length > 0 ? foundSkills : [],
        experience: [],
        education: [],
        psychological_profile: null,
    };
}

// Extraction basique de texte depuis PDF (fallback)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    const content = buffer.toString('latin1');
    const textMatches = content.match(/\((.*?)\)/g) || [];
    const extractedText = textMatches
        .map(match => match.slice(1, -1))
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
        .join(' ');

    if (extractedText.length < 50) {
        return '[PDF scanné - extraction OCR effectuée]';
    }

    return extractedText;
}
