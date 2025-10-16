export interface SocialLink {
    id: string;
    about_me_id?: string;
    platform: string;
    url: string;
    icon?: string;
    display_order?: number;
    created_at?: string;
    updated_at?: string;
}

export type SocialLinks = SocialLink[];