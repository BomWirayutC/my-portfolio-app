'use client'

import React from "react"
import { Projects } from "../services/models/projects"
import ProjectCard from "./ProjectCard";

const ProjectsSection = ({ projects }: { projects: Projects }) => {
    return (
        <section id="projects" className="py-24 px-6 bg-muted/30">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
                    <p className="text-xl text-muted-foreground">
                        Here are some of my recent works that showcase my skills and passion
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                            <p className="text-muted-foreground">No projects found.</p>
                        </div>
                    ) : (
                        projects.map((project, index) => (
                            <div key={project.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <ProjectCard
                                    title={project.title}
                                    description={project.description || ""}
                                    image={project.image || "/placeholder.svg"}
                                    technologies={project.technologies}
                                    demoUrl={project.demo_url || ""}
                                    githubUrl={project.github_url || ""}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

export default ProjectsSection