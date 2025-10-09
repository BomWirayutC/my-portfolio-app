import React from "react";
import { Projects } from "../services/models/projects";
import ProjectCard from "./ProjectCard";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const ProjectSection = ({ isLoading, projects }: { isLoading: boolean, projects: Projects }) => {
    return (
        <div className="container mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
                <p className="text-xl text-muted-foreground">
                    Here are some of my recent works that showcase my skills and passion
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            <Card className="overflow-hidden">
                                <Skeleton className="aspect-video w-full" />
                                <CardHeader className="space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-1">
                                        {Array.from({ length: 3 }).map((_, j) => (
                                            <Skeleton key={j} className="h-5 w-16" />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-9 w-20" />
                                        <Skeleton className="h-9 w-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))
                ) : projects.length === 0 ? (
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
    )
}

export default ProjectSection;