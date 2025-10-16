'use client'

import { useEffect, useState } from "react";
import { getCertificates, getProjects, getProfile, getSkills } from "./services/api";
import { Profile, SocialLinks, Skills, Certificates, Projects } from "./services/models";
import {
    MainCoverSection,
    CertificateSection,
    Navigation,
    ProfileSection,
    ProjectSection,
    LoadingOverlay,
} from "./components";
import { supabase } from "./services/supabase/client";

const Portfolio = () => {
    const [projects, setProjects] = useState<Projects>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLinks>([]);
    const [skills, setSkills] = useState<Skills>([]);
    const [certificates, setCertificates] = useState<Certificates>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await Promise.all([
            fetchProjects(),
            fetchProfile(),
            fetchSocialLinks(),
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

    const fetchProfile = async () => {
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

    const fetchSocialLinks = async () => {
        try {
            const { data, error } = await supabase
                .from('social_links')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setSocialLinks(data || []);
        } catch (error) {
            console.error('Error fetching social links:', error);
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
            <section id="profile" className="py-24 px-6">
                <ProfileSection isLoading={isLoading} profileData={profile} socialLinks={socialLinks} skills={skills} />
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