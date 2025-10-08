import Image from "next/image";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import Navigation from "./components/Navigation";
import ProjectCard from "./components/ProjectCard";
import { Mail, Download, Code, Palette, Database, Smartphone, Award } from "lucide-react";
import { getCertificates, getProjects, getProfile, getSkills } from "./services/api";
import Profile from "./services/models/profile";
import { Skills } from "./services/models/skills";
import { Certificates } from "./services/models/certificates";
import { Projects } from "./services/models/projects";
import CertificateSection from "./components/CertificateSection";

const getSkillIcon = (iconName?: string) => {
    switch (iconName) {
        case 'Code': return Code;
        case 'Database': return Database;
        case 'Palette': return Palette;
        case 'Smartphone': return Smartphone;
        default: return Code;
    }
};

export default async function Portfolio() {
    const [projectsRes, aboutMeRes, skillsRes, certificatesRes] = await Promise.all([
        getProjects(),
        getProfile(),
        getSkills(),
        getCertificates(),
    ]);

    const projects: Projects = projectsRes.status === 200 ? projectsRes.data : [];
    const aboutMe: Profile | null = aboutMeRes.status === 200 ? aboutMeRes.data : null;
    const skills: Skills = skillsRes.status === 200 ? skillsRes.data : [];
    const certificates: Certificates = certificatesRes.status === 200 ? certificatesRes.data : [];

    return (
        <div className="min-h-screen bg-background">
            <Navigation isDisplayProjectNav={projects.length > 0} isDisplayCertificateNav={certificates.length > 0} />

            {/* Main Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${aboutMe?.cover_image || "/hero-workspace.jpg"})`, zIndex: 1 }}
                />
                <div className="absolute inset-0 bg-black" />
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

            {/* Profile Section */}
            <section id="profile" className="py-24 px-6">
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
                            {skills.map((skill) => {
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
                            })}
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

            {/* Certificates Section */}
            <section id="certificates" className="py-24 px-6">
                <CertificateSection certificates={certificates} />
            </section>

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
}