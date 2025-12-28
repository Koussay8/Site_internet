// Types pour l'application CV Profiler

export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    cv_url?: string;
    cv_text?: string;
    match_score?: number;
    psychological_profile?: PsychologicalProfile;
    playground_ids: string[];
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Experience {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
}

export interface Education {
    degree: string;
    school: string;
    year: string;
}

export interface PsychologicalProfile {
    motivations: string[];
    communicationStyle: string;
    strengths: string[];
    redFlags: string[];
    personalityType: string;
    confidence: number;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    required_skills: SkillRequirement[];
    min_experience: number;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface SkillRequirement {
    name: string;
    importance: number; // 1-10
    minLevel?: number;
}

export interface Playground {
    id: string;
    name: string;
    description?: string;
    color: string;
    candidate_ids: string[];
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface PublicForm {
    id: string;
    title: string;
    description: string;
    job_id?: string;
    fields: FormField[];
    is_active: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface FormField {
    id: string;
    type: 'text' | 'email' | 'phone' | 'file' | 'textarea' | 'select';
    label: string;
    required: boolean;
    options?: string[];
}

export interface DashboardStats {
    totalCandidates: number;
    totalJobs: number;
    totalPlaygrounds: number;
    candidatesThisMonth: number;
    averageMatchScore: number;
    topSkills: { name: string; count: number }[];
    candidatesByMonth: { month: string; count: number }[];
}

export interface UploadStatus {
    id: string;
    filename: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    candidate_id?: string;
    error?: string;
}
