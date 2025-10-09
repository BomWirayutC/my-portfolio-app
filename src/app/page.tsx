'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Skeleton } from "./components/ui/skeleton";
import Navigation from "./components/Navigation";
import ProjectCard from "./components/ProjectCard";
import { getCertificates, getProjects, getProfile, getSkills } from "./services/api";
import Profile from "./services/models/profile";
import { Skills } from "./services/models/skills";
import { Certificates } from "./services/models/certificates";
import { Projects } from "./services/models/projects";
import CertificateSection from "./components/CertificateSection";
import MainCoverSection from "./components/MainCoverSection";
import ProfileSection from "./components/ProfileSection";
import ProjectSection from "./components/ProjectSection";
import LoadingOverlay from "./components/LoadingOverlay";

const Portfolio = () => {
    const [projects, setProjects] = useState<Projects>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [skills, setSkills] = useState<Skills>([]);
    const [certificates, setCertificates] = useState<Certificates>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await Promise.all([
            fetchProjects(),
            fetchprofile(),
            fetchSkills(),
            fetchCertificates(),
        ]).then(() => setIsLoading(false));
    };

    const fetchProjects = async () => {
        try {
            await getProjects().then((res) => {
                if (res.status === 200) {
                    setProjects(res.data);
                }
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchprofile = async () => {
        try {
            await getProfile().then((res) => {
                if (res.status === 200) {
                    setProfile(res.data);
                }
            });
        } catch (error) {
            console.error('Error fetching about me:', error);
        }
    };

    const fetchSkills = async () => {
        try {
            await getSkills().then((res) => {
                if (res.status === 200) {
                    setSkills(res.data);
                }
            });
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const fetchCertificates = async () => {
        try {
            await getCertificates().then((res) => {
                if (res.status === 200) {
                    setCertificates(res.data);
                }
            });
        } catch (error) {
            console.error('Error fetching certificates:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <Navigation isDisplayProjectNav={projects.length > 0} isDisplayCertificateNav={certificates.length > 0} />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <MainCoverSection isLoading={isLoading} profileData={profile} />
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-6">
                <ProfileSection isLoading={isLoading} profileData={profile} skills={skills} />
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-24 px-6 bg-muted/30">
                <ProjectSection isLoading={isLoading} projects={projects} />
            </section>

            {/* Certificates Section */}
            <section id="certificates" className="py-24 px-6">
                <CertificateSection certificates={certificates} />
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-border">
                <div className="container mx-auto text-center">
                    <p className="text-muted-foreground">
                        © 2025 {profile?.name || ""}
                    </p>
                </div>
            </footer>

            <LoadingOverlay isLoading={isLoading} />
        </div>
    );
};

export default Portfolio;