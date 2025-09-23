export interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    technologies: string[];
    demo_url?: string;
    github_url?: string;
}

export type Projects = Project[];