export interface Skill {
    id: string | null
    created_at: string | null
    display_order: number | null
    icon: string | null
    level: number
    name: string
    updated_at: string | null
}

export type Skills = Skill[];