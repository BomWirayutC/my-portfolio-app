import React from 'react'
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

interface AdminNavigationProps {
    profileRef: React.RefObject<HTMLDivElement>;
    socialLinksRef: React.RefObject<HTMLDivElement>;
    skillsRef: React.RefObject<HTMLDivElement>;
    projectsRef: React.RefObject<HTMLDivElement>;
    certificatesRef: React.RefObject<HTMLDivElement>;
    handleLogout: () => {}
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({
    profileRef,
    socialLinksRef,
    skillsRef,
    projectsRef,
    certificatesRef,
    handleLogout,
}) => {
    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scrollToSection(profileRef)}
                        >
                            Profile
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scrollToSection(socialLinksRef)}
                        >
                            Social Links
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scrollToSection(skillsRef)}
                        >
                            Skills
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scrollToSection(projectsRef)}
                        >
                            Projects
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scrollToSection(certificatesRef)}
                        >
                            Certificates
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default AdminNavigation;