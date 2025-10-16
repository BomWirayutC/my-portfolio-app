import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { Profile, SocialLinks, Skills } from "@/app/services/models";
import { ExternalLink, Mail } from "lucide-react";
import { Progress } from "./ui/progress";
import { getSkillIcon } from "../utils/skillIcons";
import { Button } from "./ui/button";
import { getSocialIcon } from "../utils/socialIcons";

const ProfileSection = ({
    isLoading, profileData, skills, socialLinks,
}: {
    isLoading: boolean, profileData: Profile | null, skills: Skills, socialLinks: SocialLinks,
}) => {
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
            <div className="grid md:grid-cols-2 gap-12 items-center mb-14">
                <div className="space-y-6 ">
                    {profileData?.avatar_url && (
                        <div className="flex justify-center mb-6">
                            <Image
                                src={profileData.avatar_url}
                                alt={profileData.name || "Avatar"}
                                width={50}
                                height={50}
                                className="w-50 h-50 rounded-full object-cover shadow-card"
                                unoptimized={true}
                            />
                        </div>
                    )}
                    <div className="space-y-4">
                        {profileData?.email && (
                            <p className="flex justify-center items-center gap-2 text-lg">
                                <Mail className="w-5 h-5 text-primary" />
                                <Link href={`mailto:${profileData.email}`} className="hover:text-primary transition-colors">
                                    {profileData.email}
                                </Link>
                            </p>
                        )}
                        {profileData?.phone && (
                            <p className="flex justify-center items-center gap-2 text-lg">
                                📞 {profileData.phone}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-4 pr-0 md:pr-30">
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
            <div className="space-y-4 flex flex-row justify-center items-center">
                {
                    socialLinks.length > 0 && (
                        <div className="flex gap-4 flex-wrap justify-center items-center">
                            {
                                socialLinks.map((link) => {
                                    const SocialIcon = getSocialIcon(link.icon);
                                    return (
                                        <Button
                                            key={link.id}
                                            variant="outline"
                                            size="lg"
                                            asChild
                                            className="flex items-center gap-2"
                                        >
                                            <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                                <SocialIcon className="w-5 h-5" />
                                                {link.platform}
                                                <ExternalLink className="w-4 h-4 ml-1" />
                                            </Link>
                                        </Button>
                                    );
                                })
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default ProfileSection;