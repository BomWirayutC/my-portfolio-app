import React from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Edit2, Trash2, GripVertical } from "lucide-react";
import { Skill } from "../services/models/skills";
import { Button } from "../components/ui/button";
import { Project } from "../services/models/projects";
import { Certificate } from "../services/models/certificates";
import { SocialLink } from "../services/models/socialLink";
import { getSkillIcon } from "../utils/skillIcons";
import { getSocialIcon } from "../utils/socialIcons";

// Sortable Skill Item Component
interface SortableSkillItemProps {
    skill: Skill;
    onEdit: (skill: Skill) => void;
    onDelete: (id: string) => void;
}

export function SortableSkillItem({ skill, onEdit, onDelete }: SortableSkillItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: skill.id || "-1" });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const SkillIcon = getSkillIcon(skill.icon || "");

    return (
        <Card ref={setNodeRef} style={style} className="shadow-card">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing touch-none"
                    >
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{skill.name}</span>
                            <Badge variant="secondary">{skill.level}%</Badge>
                            {
                                skill.icon &&
                                <Badge variant="outline">
                                    <SkillIcon className="w-5 h-5 text-primary mr-2" />{skill.icon}
                                </Badge>
                            }
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${skill.level}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(skill)}
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(skill.id || "-1")}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Sortable Project Item Component
interface SortableProjectItemProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

export function SortableProjectItem({ project, onEdit, onDelete }: SortableProjectItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id || "-1" });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style} className="shadow-card">
            <CardHeader>
                <div className="flex items-start gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing touch-none pt-1"
                    >
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(project)}
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(project.id || "-1")}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                            {tech}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Sortable Certificate Item Component
interface SortableCertificateItemProps {
    certificate: Certificate;
    onEdit: (certificate: Certificate) => void;
    onDelete: (id: string) => void;
}

export function SortableCertificateItem({ certificate, onEdit, onDelete }: SortableCertificateItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: certificate.id || "-1" });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style} className="shadow-card">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing touch-none"
                    >
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium">{certificate.title}</h3>
                        <p className="text-sm text-muted-foreground">{certificate.issuer}</p>
                        {certificate.issue_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Issued: {new Date(certificate.issue_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(certificate)}
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(certificate.id || "-1")}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Sortable Social Link Item Component
interface SortableSocialLinkItemProps {
    socialLink: SocialLink;
    onEdit: (socialLink: SocialLink) => void;
    onDelete: (id: string) => void;
}

export function SortableSocialLinkItem({ socialLink, onEdit, onDelete }: SortableSocialLinkItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: socialLink.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const SocialIcon = getSocialIcon(socialLink.icon || "");

    return (
        <Card ref={setNodeRef} style={style} className="shadow-card">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing touch-none"
                    >
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{socialLink.platform}</span>
                            {
                                socialLink.icon &&
                                <Badge variant="outline">
                                    <SocialIcon className="w-5 h-5 text-primary mr-2" />{socialLink.icon}
                                </Badge>
                            }
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{socialLink.url}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(socialLink)}
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(socialLink.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}