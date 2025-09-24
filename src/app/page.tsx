'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Skeleton } from "./components/ui/skeleton";
import Navigation from "./components/Navigation";
import ProjectCard from "./components/ProjectCard";
import { CertificateModal } from "./components/CertificateModal";
import { Mail, Download, Code, Palette, Database, Smartphone, Award } from "lucide-react";
import { getCertificates, getProjects, getProfile, getSkills } from "./services/apis";
import Profile from "./services/models/profile";
import { Skills } from "./services/models/skills";
import { Certificate, Certificates } from "./services/models/certificates";
import { Projects } from "./services/models/projects";

const Portfolio = () => {
    const [projects, setProjects] = useState<Projects>([]);
    const [aboutMe, setAboutMe] = useState<Profile | null>(null);
    const [skills, setSkills] = useState<Skills>([]);
    const [certificates, setCertificates] = useState<Certificates>([]);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await Promise.all([
            fetchProjects(),
            fetchAboutMe(),
            fetchSkills(),
            fetchCertificates(),
        ]);
        setLoading(false);
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

    const fetchAboutMe = async () => {
        try {
            await getProfile().then((res) => {
                if (res.status === 200) {
                    setAboutMe(res.data);
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

    const getSkillIcon = (iconName?: string) => {
        switch (iconName) {
            case 'Code': return Code;
            case 'Database': return Database;
            case 'Palette': return Palette;
            case 'Smartphone': return Smartphone;
            default: return Code;
        }
    };

    const handleCertificateClick = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setIsModalOpen(true);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${aboutMe?.cover_image || "/hero-workspace.jpg"})` }}
                />
                <div className="a bsolute inset-0 bg-black" />
                <div className="relative z-10 text-center text-white px-6 animate-fade-in">
                    {
                        aboutMe?.name &&
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
                            {aboutMe?.name || ""}
                        </h1>
                    }
                    {
                        aboutMe?.description &&
                        <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-up">
                            {aboutMe?.description || ""}
                        </p>
                    }
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                        {aboutMe?.email && (
                            <Button size="lg" className="gradient-primary shadow-glow" asChild>
                                <a href={`mailto:${aboutMe.email}`}>
                                    <Mail className="w-5 h-5 mr-2" />
                                    Get In Touch
                                </a>
                            </Button>
                        )}
                        {aboutMe?.resume_url && (
                            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                                <a href={aboutMe.resume_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-5 h-5 mr-2" />
                                    Download CV
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-6">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">{aboutMe?.title || "About Me"}</h2>
                        {aboutMe?.bio && (
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                {aboutMe.bio}
                            </p>
                        )}
                        {aboutMe?.location && (
                            <p className="text-lg text-muted-foreground mt-2">
                                📍 {aboutMe.location}
                            </p>
                        )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            {aboutMe?.avatar_url && (
                                <div className="flex justify-center md:justify-start mb-6">
                                    <Image
                                        src={aboutMe.avatar_url}
                                        alt={aboutMe.name || "Avatar"}
                                        width={32}
                                        height={32}
                                        className="w-32 h-32 rounded-full object-cover shadow-card"
                                        unoptimized={true}
                                    />
                                </div>
                            )}
                            <div className="space-y-4">
                                {aboutMe?.email && (
                                    <p className="flex items-center gap-2 text-lg">
                                        <Mail className="w-5 h-5 text-primary" />
                                        <a href={`mailto:${aboutMe.email}`} className="hover:text-primary transition-colors">
                                            {aboutMe.email}
                                        </a>
                                    </p>
                                )}
                                {aboutMe?.phone && (
                                    <p className="flex items-center gap-2 text-lg">
                                        📞 {aboutMe.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
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
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-24 px-6 bg-muted/30">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
                        <p className="text-xl text-muted-foreground">
                            Here are some of my recent works that showcase my skills and passion
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
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
                                        demoUrl={project.demo_url}
                                        githubUrl={project.github_url}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Certificates Section */}
            {certificates.length > 0 && (
                <section id="certificates" className="py-24 px-6">
                    <div className="container mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4">Certifications</h2>
                            <p className="text-xl text-muted-foreground">
                                Professional certifications and achievements
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <Card className="overflow-hidden">
                                            <CardHeader className="space-y-4">
                                                <Skeleton className="aspect-video w-full rounded-lg" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-3/4" />
                                                    <Skeleton className="h-4 w-1/2" />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <Skeleton className="h-5 w-20" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-2/3" />
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))
                            ) : (
                                certificates.map((certificate, index) => (
                                    <Card
                                        key={certificate.id}
                                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                        onClick={() => handleCertificateClick(certificate)}
                                    >
                                        <CardHeader className="space-y-4">
                                            {certificate.image && (
                                                <div className="relative overflow-hidden rounded-lg aspect-video">
                                                    <Image
                                                        src={certificate.image}
                                                        alt={`${certificate.title} certificate`}
                                                        width={400}
                                                        height={225}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        priority={true}
                                                    />
                                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <Award className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <CardTitle className="text-lg">{certificate.title}</CardTitle>
                                                <CardDescription className="text-primary font-medium">
                                                    {certificate.issuer}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {certificate.issue_date && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {formatDate(certificate.issue_date)}
                                                </Badge>
                                            )}
                                            {certificate.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {certificate.description}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Certificate Modal */}
            <CertificateModal
                certificate={selectedCertificate}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-border">
                <div className="container mx-auto text-center">
                    <p className="text-muted-foreground">
                        © 2025 {aboutMe?.name || ""}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Portfolio;