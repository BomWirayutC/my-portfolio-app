export interface Certificate {
    certificate_url?: string | null
    created_at?: string
    description?: string | null
    display_order?: number | null
    id?: string
    image?: string | null
    issue_date?: string | null
    issuer: string
    title: string
    updated_at?: string
    certificate_image_preview?: string | null;
}

export type Certificates = Certificate[];