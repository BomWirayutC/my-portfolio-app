export interface Skill {
    id: string
    created_at: string
    display_order: number | null
    icon: string | null
    level: number
    name: string
    updated_at: string
}

export type Skills = Skill[];