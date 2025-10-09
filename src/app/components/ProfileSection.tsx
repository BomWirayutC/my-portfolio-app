import React from "react";
import Profile from "../services/models/profile"
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { Skills } from "@/app/services/models/skills";
import { Mail, Code, Palette, Database, Smartphone } from "lucide-react";
import { Progress } from "./ui/progress";

const profileDataSection = ({
    isLoading, profileData, skills
}: {
    isLoading: boolean, profileData: Profile | null, skills: Skills
}) => {
    const getSkillIcon = (iconName?: string) => {
        switch (iconName) {
            case 'Code': return Code;
            case 'Database': return Database;
            case 'Palette': return Palette;
            case 'Smartphone': return Smartphone;
            default: return Code;
        }
    };

    return (
        <div className="container mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">{profileData?.title || "About Me"}</h2>
                {profileData?.bio && (
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        {profileData.bio}
                    </p>
                )}
                {profileData?.location && (
                    <p className="text-lg text-muted-foreground mt-2">
                        📍 {profileData.location}
                    </p>
                )}
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    {profileData?.avatar_url && (
                        <div className="flex justify-center md:justify-start mb-6">
                            <Image
                                src={profileData.avatar_url}
                                alt={profileData.name || "Avatar"}
                                width={32}
                                height={32}
                                className="w-32 h-32 rounded-full object-cover shadow-card"
                                unoptimized={true}
                            />
                        </div>
                    )}
                    <div className="space-y-4">
                        {profileData?.email && (
                            <p className="flex items-center gap-2 text-lg">
                                <Mail className="w-5 h-5 text-primary" />
                                <a href={`mailto:${profileData.email}`} className="hover:text-primary transition-colors">
                                    {profileData.email}
                                </a>
                            </p>
                        )}
                        {profileData?.phone && (
                            <p className="flex items-center gap-2 text-lg">
                                📞 {profileData.phone}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-5 h-5" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                            </div>
                        ))
                    ) : (
                        skills.map((skill) => {
                            const SkillIcon = getSkillIcon(skill.icon || "");
                            return (
                                <div key={skill.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <SkillIcon className="w-5 h-5 text-primary" />
                                            <span className="font-medium">{skill.name}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                                    </div>
                                    <Progress value={skill.level} className="h-2" />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default profileDataSection;