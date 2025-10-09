import React from "react";
import Profile from "../services/models/profile";
import { Button } from "./ui/button";
import { Download, Mail } from "lucide-react";

const MainCoverSection = ({ isLoading, profileData }: { isLoading: boolean, profileData: Profile | null }) => {
    return (
        <>
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in"
                style={{ backgroundImage: `url(${profileData?.cover_image || "/hero-workspace.jpg"})` }}
            />
            <div className="a bsolute inset-0 bg-black" />
            <div className="relative z-10 text-center text-white px-6 animate-fade-in">
                {
                    profileData?.name &&
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
                        {profileData?.name || ""}
                    </h1>
                }
                {
                    profileData?.description &&
                    <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-up">
                        {profileData?.description || ""}
                    </p>
                }
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                    {profileData?.email && (
                        <Button size="lg" className="gradient-primary shadow-glow" asChild>
                            <a href={`mailto:${profileData.email}`}>
                                <Mail className="w-5 h-5 mr-2" />
                                Get In Touch
                            </a>
                        </Button>
                    )}
                    {profileData?.resume_url && (
                        <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                            <a href={profileData.resume_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-5 h-5 mr-2" />
                                Download CV
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </>
    )
}

export default MainCoverSection;