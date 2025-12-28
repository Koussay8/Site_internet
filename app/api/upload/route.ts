import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// POST - Upload de CVs
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

                // Extraire le texte selon le type de fichier
                let extractedText = '';
                const fileType = file.type;
                const fileName = file.name.toLowerCase();

                if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                    // Pour PDF, on utilise une extraction basique
                    // Note: Pour une vraie OCR, intégrer un service comme pdf-parse ou AWS Textract
                    extractedText = await extractTextFromPDF(buffer);
                } else if (
                    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    fileName.endsWith('.docx')
                ) {
                    extractedText = await extractTextFromDOCX(buffer);
                } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
                    extractedText = buffer.toString('utf-8');
                } else {
                    // Image - nécessite OCR externe
                    extractedText = `[Contenu image: ${file.name}]`;
                }

                // Mettre à jour le statut à 50%
                await supabase
                    .from('upload_status')
                    .update({ progress: 50 })
                    .eq('id', uploadStatus.id);

                // Analyser le CV avec l'IA pour extraire les informations
                const candidateData = await parseCVWithAI(extractedText, user.userId);

                // Créer le candidat dans la base de données
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

                // Mettre à jour le statut de l'upload
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

// Extraction basique de texte depuis PDF
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // Extraction basique - chercher les chaînes de texte dans le PDF
    const content = buffer.toString('latin1');

    // Extraire le texte entre les balises PDF
    const textMatches = content.match(/\((.*?)\)/g) || [];
    const extractedText = textMatches
        .map(match => match.slice(1, -1))
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
        .join(' ');

    // S'il n'y a pas assez de texte, retourner un message
    if (extractedText.length < 50) {
        return '[PDF potentiellement scanné - OCR requis pour extraction complète]';
    }

    return extractedText;
}

// Extraction basique de texte depuis DOCX
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
    // Les fichiers DOCX sont des archives ZIP contenant du XML
    // Pour une extraction complète, utiliser une bibliothèque comme mammoth
    const content = buffer.toString('utf-8');

    // Chercher du texte entre les balises XML
    const textMatches = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
    const extractedText = textMatches
        .map(match => match.replace(/<[^>]+>/g, ''))
        .join(' ');

    return extractedText || '[Contenu DOCX non extrait]';
}

// Parser le CV avec l'IA
async function parseCVWithAI(text: string, userId: string): Promise<{
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: object[];
    education: object[];
}> {
    // Extraction basique des informations
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/);

    // Extraction du nom (première ligne ou pattern)
    const lines = text.split('\n').filter(l => l.trim());
    let name = 'Candidat Importé';

    if (lines.length > 0) {
        // Prendre la première ligne non-email comme nom potentiel
        for (const line of lines.slice(0, 5)) {
            const cleaned = line.trim();
            if (cleaned && !cleaned.includes('@') && !cleaned.match(/^\d/) && cleaned.length < 50) {
                name = cleaned;
                break;
            }
        }
    }

    // Extraction des compétences (recherche de mots-clés tech)
    const skillKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift',
        'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD',
        'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
        'REST', 'GraphQL', 'API', 'Microservices',
        'Agile', 'Scrum', 'Jira', 'Confluence',
        'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
        'Linux', 'DevOps', 'Terraform', 'Ansible'
    ];

    const foundSkills = skillKeywords.filter(skill =>
        text.toLowerCase().includes(skill.toLowerCase())
    );

    return {
        name,
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        skills: foundSkills.length > 0 ? foundSkills : ['À compléter'],
        experience: [],
        education: [],
    };
}
