export interface SkillForm {
    name: string;
    level: number;
    icon?: string;
    display_order?: number;
}

export interface CertificateForm {
    title: string;
    issuer: string;
    image?: string;
    certificate_url?: string;
    issue_date?: string;
    description?: string;
    display_order?: number;
}

export interface ProjectForm {
    title: string;
    description: string;
    image: string;
    technologies: string;
    demo_url?: string;
    github_url?: string;
}

export interface ProfileForm {
    title: string;
    name: string;
    description: string;
    bio: string;
    avatar_url?: string;
    cover_image?: string;
    location?: string;
    email?: string;
    phone?: string;
    linkedin_url?: string;
    github_url?: string;
    resume_url?: string;
}

export interface SocialLinkForm {
    platform: string;
    url: string;
    icon?: string;
}