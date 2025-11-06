'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
    title: string;
    description: string;
    image: string;
    technologies: string[];
    demoUrl?: string;
    githubUrl?: string;
}

const ProjectCard = ({ title, description, image, technologies, demoUrl, githubUrl }: ProjectCardProps) => {
    const onHandleLink = (url: string) => {
        window.open(url, "_blank");
    }

    return (
        <Card className="group overflow-hidden shadow-card hover:shadow-elegant transition-spring hover:-translate-y-2">
            <div className="aspect-video overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                />
            </div>
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                    {technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button size="sm" className="gradient-primary" onClick={() => onHandleLink(demoUrl || "")} disabled={!demoUrl}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Demo
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onHandleLink(githubUrl || "")} disabled={!githubUrl}>
                        <Github className="w-4 h-4 mr-2" />
                        Code
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProjectCard;