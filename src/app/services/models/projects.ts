export interface Project {
    id: string | null;
    title: string;
    description: string;
    image: string;
    technologies: string[];
    demo_url?: string | null;
    github_url?: string | null;
}

export type Projects = Project[];