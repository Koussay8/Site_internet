import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Configuration OCR
const OCR_API_URL = process.env.OCR_API_URL || 'https://external8-cv-profiler-ocr.hf.space/api/predict';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Vercel: augmenter le timeout à 60 secondes
export const maxDuration = 60;

// Fonction pour nettoyer le texte (supprimer caractères null et invalides pour PostgreSQL)
function cleanText(text: string): string {
    if (!text) return '';
    return text
        .replace(/\u0000/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim();
}


// GET - Récupérer un formulaire public (sans auth)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const { formId } = await params;

        const { data, error } = await supabase
            .from('forms')
            .select('id, title, description, fields, job_id, is_active')
            .eq('id', formId)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Formulaire non trouvé' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Soumettre une candidature (sans auth)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const { formId } = await params;

        // Vérifier que le formulaire existe et est actif
        const { data: form, error: formError } = await supabase
            .from('forms')
            .select('id, user_id, job_id, is_active')
            .eq('id', formId)
            .eq('is_active', true)
            .single();

        if (formError || !form) {
            return NextResponse.json({ error: 'Formulaire non disponible' }, { status: 404 });
        }

        const formData = await request.formData();

        // Extraire les données du formulaire
        const name = formData.get('name') as string || '';
        const email = formData.get('email') as string || '';
        const phone = formData.get('phone') as string || '';
        const cvFile = formData.get('cv') as File | null;
        const customData = formData.get('custom_data') as string || '{}';

        let extractedText = '';
        let aiAnalysis = null;

        // Si un CV est fourni, faire l'OCR et l'analyse
        if (cvFile) {
            const arrayBuffer = await cvFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');

            // OCR
            try {
                const ocrResponse = await fetch(OCR_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: [`data:${cvFile.type};base64,${base64}`]
                    }),
                });

                if (ocrResponse.ok) {
                    const ocrData = await ocrResponse.json();
                    extractedText = ocrData.data?.[0] || '';
                    // Nettoyer le texte
                    extractedText = cleanText(extractedText);
                }
            } catch (e) {
                console.error('OCR error:', e);
            }

            // Analyse IA si texte extrait
            if (extractedText && GROQ_API_KEY) {
                aiAnalysis = await analyzeWithGroq(extractedText);
            }
        }

        // Créer le candidat
        const candidateData = {
            name: aiAnalysis?.name || name || 'Candidat',
            email: aiAnalysis?.email || email || '',
            phone: aiAnalysis?.phone || phone || '',
            skills: aiAnalysis?.skills || [],
            experience: aiAnalysis?.experience || [],
            education: aiAnalysis?.education || [],
            psychological_profile: aiAnalysis?.psychological_profile || null,
            cv_text: extractedText,
            user_id: form.user_id,
            source_form_id: form.id,
        };

        const { data: candidate, error: candidateError } = await supabase
            .from('candidates')
            .insert(candidateData)
            .select()
            .single();

        if (candidateError) {
            console.error('Candidate creation error:', candidateError);
            return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
        }

        // Enregistrer la soumission
        await supabase
            .from('form_submissions')
            .insert({
                form_id: form.id,
                candidate_id: candidate.id,
                data: JSON.parse(customData),
            });

        return NextResponse.json({
            success: true,
            message: 'Candidature envoyée avec succès',
            candidate_id: candidate.id,
        }, { status: 201 });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Analyse avec Groq
async function analyzeWithGroq(text: string) {
    if (!GROQ_API_KEY || !text) return null;

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
                        content: `Extrais les informations du CV. Retourne UNIQUEMENT un JSON:
{
  "name": "Nom",
  "email": "email",
  "phone": "tel",
  "skills": ["Skill1"],
  "experience": [{"title": "Poste", "company": "Entreprise", "startDate": "2020", "endDate": "2023"}],
  "education": [{"degree": "Diplôme", "school": "École", "year": "2020"}],
  "psychological_profile": {"personalityType": "Type", "strengths": ["Force1"]}
}`
                    },
                    { role: 'user', content: text.substring(0, 6000) }
                ],
                temperature: 0.1,
                max_tokens: 1500,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
    } catch (e) {
        console.error('Groq error:', e);
    }
    return null;
}
