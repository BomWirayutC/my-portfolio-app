'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { TextArea } from "../components/ui/textArea";
import { Badge } from "../components/ui/badge";
import { Plus, Edit2, Trash2, Save, LogOut } from "lucide-react";
import { useToast } from "../utils/hooks/useToast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { supabase } from "../services/supabase/client";
import { Project, Projects } from "../services/models/projects";
import Profile from "../services/models/profile";
import { Skill, Skills } from "../services/models/skills";
import { Certificate, Certificates } from "../services/models/certificates";
import {
    addCertificate,
    addProject,
    addSkill,
    deleteCertificateById,
    deleteProjectById,
    deleteSkillById,
    getCertificates,
    getProfile,
    getProjects,
    getSkills,
    updateCertificateById,
    updateProfile,
    updateProjectById,
    updateSkillById,
    uploadFile
} from "../services/api";
import { Toaster } from "../components/ui/toaster";
import { localStorageUtil } from "../utils/localStorageUtil";

interface SkillForm {
    name: string;
    level: number;
    icon?: string;
    display_order?: number;
}

interface CertificateForm {
    title: string;
    issuer: string;
    image?: string;
    certificate_url?: string;
    issue_date?: string;
    description?: string;
    display_order?: number;
}

interface ProjectForm {
    title: string;
    description: string;
    image: string;
    technologies: string;
    demo_url?: string;
    github_url?: string;
}

interface AboutMeForm {
    title: string;
    name: string;
    description: string;
    bio: string;
    avatar_url?: string;
    cover_image?: string;
    location?: string;
    email?: string;
    phone?: string;
    linkedin_url?: string;
    github_url?: string;
    resume_url?: string;
}

const Admin = () => {
    const { toast } = useToast();
    const navigate = useRouter();
    const [projects, setProjects] = useState<Projects>([]);
    const [aboutMe, setAboutMe] = useState<Profile | null>(null);
    const [skills, setSkills] = useState<Skills>([]);
    const [certificates, setCertificates] = useState<Certificates>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isAddingNewSkill, setIsAddingNewSkill] = useState(false);
    const [isAddingNewCertificate, setIsAddingNewCertificate] = useState(false);
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [loading, setLoading] = useState(false);

    // File states for delayed upload
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
    const [certificateImageFile, setCertificateImageFile] = useState<File | null>(null);

    const projectForm = useForm<ProjectForm>({
        defaultValues: {
            title: "",
            description: "",
            image: "",
            technologies: "",
            demo_url: "",
            github_url: "",
        },
    });

    const aboutMeForm = useForm<AboutMeForm>({
        defaultValues: {
            title: "",
            name: "",
            description: "",
            bio: "",
            avatar_url: "",
            cover_image: "",
            location: "",
            email: "",
            phone: "",
            linkedin_url: "",
            github_url: "",
            resume_url: "",
        },
    });

    const skillForm = useForm<SkillForm>({
        defaultValues: {
            name: "",
            level: 50,
            icon: "Code",
            display_order: 0,
        },
    });

    const certificateForm = useForm<CertificateForm>({
        defaultValues: {
            title: "",
            issuer: "",
            image: "",
            certificate_url: "",
            issue_date: "",
            description: "",
            display_order: 0,
        },
    });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const checkAuthAndFetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                localStorageUtil.removeItem('adminLoginTime');
                navigate.replace("/admin-login");
            } else {
                fetchProjects();
                fetchAboutMe();
                fetchSkills();
                fetchCertificates();

                // Check if login time exists and calculate remaining time
                const loginTimeStr = localStorageUtil.getItem<string>('adminLoginTime');
                if (loginTimeStr) {
                    const loginTime = parseInt(loginTimeStr);
                    const elapsed = Date.now() - loginTime;
                    const remainingTime = (10 * 60 * 1000) - elapsed; // 10 minutes - elapsed time

                    if (remainingTime <= 0) {
                        // Session already expired
                        await supabase.auth.signOut();
                        localStorageUtil.removeItem('adminLoginTime');
                        toast({
                            title: "Session Expired",
                            description: "Admin session has expired. Please log in again.",
                            variant: "destructive",
                        });
                        navigate.replace("/admin-login");
                        return;
                    }

                    // Set timeout for remaining time
                    timeoutId = setTimeout(async () => {
                        await supabase.auth.signOut();
                        localStorageUtil.removeItem('adminLoginTime');
                        toast({
                            title: "Session Expired",
                            description: "Admin session has expired. Please log in again.",
                            variant: "destructive",
                        });
                        navigate.replace("/admin-login");
                    }, remainingTime);
                }
            }
        };

        checkAuthAndFetchData();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!session) {
                    if (timeoutId) clearTimeout(timeoutId);
                    localStorage.removeItem('adminLoginTime');
                    navigate.replace("/admin-login");
                }
            }
        );

        return () => {
            subscription.unsubscribe();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [navigate, toast]);

    const fetchProjects = async () => {
        try {
            await getProjects().then((res) => {
                if (res.status === 200) {
                    setProjects(res.data);
                }
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch projects",
                variant: "destructive",
            });
        }
    };

    const fetchAboutMe = async () => {
        try {
            await getProfile().then((res) => {
                if (res.status === 200) {
                    const profileData = res.data;
                    setAboutMe(profileData);
                    aboutMeForm.reset({
                        title: profileData.title || "",
                        name: profileData.name || "",
                        description: profileData.description || "",
                        bio: profileData.bio || "",
                        avatar_url: profileData.avatar_url || "",
                        cover_image: profileData.cover_image || "",
                        location: profileData.location || "",
                        email: profileData.email || "",
                        phone: profileData.phone || "",
                        linkedin_url: profileData.linkedin_url || "",
                        github_url: profileData.github_url || "",
                        resume_url: profileData.resume_url || "",
                    });
                }
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch about me data",
                variant: "destructive",
            });
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
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch skills",
                variant: "destructive",
            });
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
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch certificates",
                variant: "destructive",
            });
        }
    };

    const onAboutMeSubmit = async (data: AboutMeForm) => {
        setLoading(true);
        try {
            // Upload avatar if file is selected
            if (avatarFile) {
                const avatarUrl = await uploadImage(avatarFile, 'avatars');
                if (avatarUrl) {
                    data.avatar_url = avatarUrl;
                } else {
                    throw new Error("Avatar upload failed");
                }
            }

            // Upload cover if file is selected
            if (coverFile) {
                const coverUrl = await uploadImage(coverFile, 'covers');
                if (coverUrl) {
                    data.cover_image = coverUrl;
                } else {
                    throw new Error("Cover upload failed");
                }
            }

            await updateProfile({
                id: aboutMe?.id || "-1",
                title: data.title,
                name: data.name,
                description: data.description,
                bio: data.bio,
                avatar_url: data.avatar_url || null,
                cover_image: data.cover_image || null,
                location: data.location || null,
                email: data.email || null,
                phone: data.phone || null,
                linkedin_url: data.linkedin_url || null,
                github_url: data.github_url || null,
                resume_url: data.resume_url || null,
                created_at: null,
                updated_at: null,
            }).then((res) => {
                console.log(res)
                if (res.status == 200) {
                    toast({
                        title: "Success!",
                        description: "About me updated successfully.",
                    });
                } else {

                    throw new Error(res.message);
                }
            })

            setIsEditingAboutMe(false);
            setAvatarFile(null);
            setCoverFile(null);
            fetchAboutMe();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save about me. Make sure you're authenticated.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    const onProjectSubmit = async (data: ProjectForm) => {
        setLoading(true);
        try {
            // Upload project image if file is selected
            if (projectImageFile) {
                const imageUrl = await uploadImage(projectImageFile, 'projects');
                if (imageUrl) {
                    data.image = imageUrl;
                } else {
                    throw new Error("Project image upload failed");
                }
            }

            const technologiesArray = data.technologies.split(',').map(tech => tech.trim()).filter(Boolean);

            if (editingProject) {
                // Update existing project
                await updateProjectById({
                    id: editingProject.id,
                    title: data.title,
                    description: data.description,
                    image: data.image,
                    technologies: technologiesArray,
                    demo_url: data.demo_url || null,
                    github_url: data.github_url || null,
                }).then((res) => {
                    if (res.status == 200) {
                        toast({
                            title: "Success!",
                            description: "Project updated successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                })
            } else {
                // Create new project
                await addProject({
                    id: null,
                    title: data.title,
                    description: data.description,
                    image: data.image,
                    technologies: technologiesArray,
                    demo_url: data.demo_url || null,
                    github_url: data.github_url || null,
                }).then((res) => {
                    if (res.status == 200) {
                        toast({
                            title: "Success!",
                            description: "Project created successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                })
            }

            projectForm.reset();
            setEditingProject(null);
            setIsAddingNew(false);
            setProjectImageFile(null);
            fetchProjects();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save project. Make sure you're authenticated.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    const handleProjectEdit = (project: Project) => {
        setEditingProject(project);
        projectForm.reset({
            title: project.title,
            description: project.description || "",
            image: project.image || "",
            technologies: project.technologies.join(', '),
            demo_url: project.demo_url || "",
            github_url: project.github_url || "",
        });
    };

    const handleProjectDelete = async (id: string) => {
        try {
            await deleteProjectById(id).then((res) => {
                if (res.status == 200) {
                    toast({
                        title: "Project Deleted",
                        description: "Project removed successfully.",
                    });
                } else {
                    throw new Error(res.message);
                }
            })
            fetchProjects();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete project.",
                variant: "destructive",
            });
        }
    };

    const handleProjectCancel = () => {
        projectForm.reset();
        setEditingProject(null);
        setIsAddingNew(false);
        setProjectImageFile(null);
    };

    const handleSkillEdit = (skill: Skill) => {
        setEditingSkill(skill);
        skillForm.reset({
            name: skill.name,
            level: skill.level,
            icon: skill.icon || "Code",
            display_order: skill.display_order || 0,
        });
    };

    const handleSkillDelete = async (id: string) => {
        try {
            await deleteSkillById(id).then((res) => {
                if (res.status === 200) {
                    toast({
                        title: "Skill Deleted",
                        description: "Skill removed successfully.",
                    });
                } else {
                    throw new Error(res.message);
                }
            })
            fetchSkills();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete skill.",
                variant: "destructive",
            });
        }
    };

    const handleSkillCancel = () => {
        skillForm.reset();
        setEditingSkill(null);
        setIsAddingNewSkill(false);
    };

    const onSkillSubmit = async (data: SkillForm) => {
        setLoading(true);
        try {
            if (editingSkill) {
                // Update existing skill
                await updateSkillById({
                    id: editingSkill.id,
                    name: data.name,
                    level: data.level,
                    icon: data.icon || null,
                    display_order: data.display_order || 0,
                    created_at: null,
                    updated_at: null,
                }).then((res) => {
                    if (res.status === 200) {
                        toast({
                            title: "Success!",
                            description: "Skill updated successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                })
            } else {
                // Create new skill
                await addSkill({
                    id: null,
                    name: data.name,
                    level: data.level,
                    icon: data.icon || null,
                    display_order: data.display_order || 0,
                    created_at: null,
                    updated_at: null,
                }).then((res) => {
                    if (res.status === 200) {
                        toast({
                            title: "Success!",
                            description: "Skill created successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                });
            }
            skillForm.reset();
            setEditingSkill(null);
            setIsAddingNewSkill(false);
            fetchSkills();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save skill. Make sure you're authenticated.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    // Certificate management functions
    const handleCertificateEdit = (certificate: Certificate) => {
        setEditingCertificate(certificate);
        certificateForm.reset({
            title: certificate.title,
            issuer: certificate.issuer,
            image: certificate.image || "",
            certificate_url: certificate.certificate_url || "",
            issue_date: certificate.issue_date || "",
            description: certificate.description || "",
            display_order: certificate.display_order || 0,
        });
    };

    const handleCertificateDelete = async (id: string) => {
        try {
            await deleteCertificateById(id).then((res) => {
                if (res.status == 200) {
                    toast({
                        title: "Certificate Deleted",
                        description: "Certificate removed successfully.",
                    });
                } else {
                    throw new Error(res.message);
                }
            })
            fetchCertificates();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete certificate.",
                variant: "destructive",
            });
        }
    };

    const handleCertificateCancel = () => {
        certificateForm.reset();
        setEditingCertificate(null);
        setIsAddingNewCertificate(false);
        setCertificateImageFile(null);
    };

    const onCertificateSubmit = async (data: CertificateForm) => {
        setLoading(true);
        try {
            // Upload certificate image if file is selected
            if (certificateImageFile) {
                const imageUrl = await uploadImage(certificateImageFile, 'projects');
                if (imageUrl) {
                    data.image = imageUrl;
                } else {
                    throw new Error("Certificate image upload failed");
                }
            }

            if (editingCertificate) {
                // Update existing certificate
                await updateCertificateById({
                    id: editingCertificate.id,
                    title: data.title,
                    issuer: data.issuer,
                    image: data.image || null,
                    certificate_url: data.certificate_url || null,
                    issue_date: data.issue_date || null,
                    description: data.description || null,
                    display_order: data.display_order || 0,
                }).then((res) => {
                    if (res.status == 200) {
                        toast({
                            title: "Success!",
                            description: "Certificate updated successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                })
            } else {
                // Create new certificate
                await addCertificate({
                    title: data.title,
                    issuer: data.issuer,
                    image: data.image || null,
                    certificate_url: data.certificate_url || null,
                    issue_date: data.issue_date || null,
                    description: data.description || null,
                    display_order: data.display_order || 0,
                }).then((res) => {
                    if (res.status == 200) {
                        toast({
                            title: "Success!",
                            description: "Certificate created successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                })
            }

            certificateForm.reset();
            setEditingCertificate(null);
            setIsAddingNewCertificate(false);
            setCertificateImageFile(null);
            fetchCertificates();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save certificate. Make sure you're authenticated.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // localStorage.removeItem('adminLoginTime');
            toast({
                title: "Logged Out",
                description: "You have been logged out successfully.",
            });
            navigate.replace("/admin-login");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to log out",
                variant: "destructive",
            });
        }
    };

    const uploadImage = async (file: File, bucket: string, fileName?: string): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const uniqueFileName = fileName || `${Date.now()}.${fileExt}`;

            const formData: FormData = new FormData();
            formData.append('file', file);
            formData.append('bucket', bucket);
            formData.append('fileName', uniqueFileName);

            let fileUrlResult = "";
            const res = await uploadFile(formData);
            if (res.status === 200) {
                fileUrlResult = res.data.fileUrl || "";
            } else {
                throw new Error(res.message);
            }
            return fileUrlResult;
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Upload Error",
                description: error instanceof Error ? error.message : "Failed to upload image",
                variant: "destructive",
            });
            return null;
        }
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAvatarFile(file);
    };

    const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setCoverFile(file);
    };

    const handleProjectImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setProjectImageFile(file);
    };

    const handleCertificateImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type (images and PDFs)
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            toast({
                title: "Invalid File Type",
                description: "Please select an image (JPG, PNG, WebP) or PDF file",
                variant: "destructive",
            });
            return;
        }

        setCertificateImageFile(file);
    };

    return (
        <div className="min-h-screen bg-background">
            <Toaster />
            <div className="container mx-auto px-6 py-24">
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Manage portfolio projects and content</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="mb-8 space-y-6">
                    {/* About Me Management Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">About Me</h2>
                            <Button
                                onClick={() => setIsEditingAboutMe(true)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                {aboutMe ? "Edit About Me" : "Create About Me"}
                            </Button>
                        </div>

                        {aboutMe && !isEditingAboutMe && (
                            <Card className="shadow-card">
                                <CardHeader>
                                    <CardTitle>{aboutMe.title}</CardTitle>
                                    <CardDescription>{aboutMe.name} - {aboutMe.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p><strong>Bio:</strong> {aboutMe.bio}</p>
                                        {aboutMe.location && <p><strong>Location:</strong> {aboutMe.location}</p>}
                                        {aboutMe.email && <p><strong>Email:</strong> {aboutMe.email}</p>}
                                        {aboutMe.phone && <p><strong>Phone:</strong> {aboutMe.phone}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isEditingAboutMe && (
                            <Card className="shadow-card">
                                <CardHeader>
                                    <CardTitle>{aboutMe ? "Edit About Me" : "Create About Me"}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form {...aboutMeForm}>
                                        <form onSubmit={aboutMeForm.handleSubmit(onAboutMeSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="title"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Section Title</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="About Me" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Full Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Alex Johnson" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={aboutMeForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Professional Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Full Stack Developer & UI/UX Designer" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={aboutMeForm.control}
                                                name="bio"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bio</FormLabel>
                                                        <FormControl>
                                                            <TextArea
                                                                placeholder="Tell us about yourself, your skills, and experience..."
                                                                {...field}
                                                                rows={4}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="avatar_url"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Avatar Image</FormLabel>
                                                            <FormControl>
                                                                <div className="space-y-2">
                                                                    <Input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleAvatarUpload}
                                                                        className="cursor-pointer"
                                                                    />
                                                                    {(field.value || avatarFile) && (
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {avatarFile ? (
                                                                                <span className="text-orange-600">File selected: {avatarFile.name}</span>
                                                                            ) : (
                                                                                <span className="text-primary">Current image uploaded</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="cover_image"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Cover Image</FormLabel>
                                                            <FormControl>
                                                                <div className="space-y-2">
                                                                    <Input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleCoverUpload}
                                                                        className="cursor-pointer"
                                                                    />
                                                                    {(field.value || coverFile) && (
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {coverFile ? (
                                                                                <span className="text-orange-600">File selected: {coverFile.name}</span>
                                                                            ) : (
                                                                                <span className="text-primary">Current image uploaded</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={aboutMeForm.control}
                                                name="location"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Location (optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="San Francisco, CA" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email (optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="your.email@example.com" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Phone (optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="+1 (555) 123-4567" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="linkedin_url"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>LinkedIn URL (optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="LinkedIn profile URL" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="github_url"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>GitHub URL (optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="GitHub profile URL" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aboutMeForm.control}
                                                    name="resume_url"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Resume URL (optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Resume/CV file URL" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <Button type="submit" className="gradient-primary" disabled={loading}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {loading ? "Saving..." : "Save About Me"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsEditingAboutMe(false)}
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Skills Management Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Skills</h2>
                            <Button
                                onClick={() => setIsAddingNewSkill(true)}
                                className="gradient-primary"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Skill
                            </Button>
                        </div>

                        {(isAddingNewSkill || editingSkill) && (
                            <Card className="shadow-card mb-4">
                                <CardHeader>
                                    <CardTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form {...skillForm}>
                                        <form onSubmit={skillForm.handleSubmit(onSkillSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={skillForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Skill Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="React/Next.js" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={skillForm.control}
                                                    name="level"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Skill Level (0-100)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={skillForm.control}
                                                    name="icon"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Icon Name</FormLabel>
                                                            <FormControl>
                                                                <select {...field} className="w-full p-2 border border-border rounded-lg">
                                                                    <option value="Code">Code</option>
                                                                    <option value="Database">Database</option>
                                                                    <option value="Palette">Palette</option>
                                                                    <option value="Smartphone">Smartphone</option>
                                                                </select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={skillForm.control}
                                                    name="display_order"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Display Order</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="submit" className="gradient-primary" disabled={loading}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {loading ? "Saving..." : "Save Skill"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleSkillCancel}
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-4">
                            {skills.map((skill) => (
                                <Card key={skill.id} className="shadow-card">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">{skill.name}</span>
                                                    <Badge variant="secondary">{skill.level}%</Badge>
                                                    {skill.icon && <Badge variant="outline">{skill.icon}</Badge>}
                                                </div>
                                                <div className="w-full bg-secondary rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${skill.level}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSkillEdit(skill)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleSkillDelete(skill.id || "-1")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Certificates Management Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Certificates</h2>
                            <Button
                                onClick={() => setIsAddingNewCertificate(true)}
                                className="gradient-primary"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Certificate
                            </Button>
                        </div>

                        {(isAddingNewCertificate || editingCertificate) && (
                            <Card className="shadow-card mb-4">
                                <CardHeader>
                                    <CardTitle>{editingCertificate ? "Edit Certificate" : "Add New Certificate"}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form {...certificateForm}>
                                        <form onSubmit={certificateForm.handleSubmit(onCertificateSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={certificateForm.control}
                                                    name="title"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Certificate Title</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="AWS Certified Solutions Architect" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={certificateForm.control}
                                                    name="issuer"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Issuer</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Amazon Web Services" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={certificateForm.control}
                                                name="image"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Certificate Image/PDF</FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-2">
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*,application/pdf"
                                                                    onChange={handleCertificateImageUpload}
                                                                    className="cursor-pointer"
                                                                />
                                                                {(field.value || certificateImageFile) && (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {certificateImageFile ? (
                                                                            <span className="text-orange-600">File selected: {certificateImageFile.name}</span>
                                                                        ) : (
                                                                            <span className="text-primary">Current file uploaded</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={certificateForm.control}
                                                    name="certificate_url"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Certificate URL (optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="https://..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={certificateForm.control}
                                                    name="issue_date"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Issue Date (optional)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="date"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={certificateForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description (optional)</FormLabel>
                                                        <FormControl>
                                                            <TextArea
                                                                placeholder="Brief description of the certificate and what it represents..."
                                                                {...field}
                                                                rows={3}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={certificateForm.control}
                                                name="display_order"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Display Order</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex gap-2">
                                                <Button type="submit" className="gradient-primary" disabled={loading}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {loading ? "Saving..." : "Save Certificate"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCertificateCancel}
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-4">
                            {certificates.map((certificate) => (
                                <Card key={certificate.id} className="shadow-card">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium">{certificate.title}</span>
                                                    <Badge variant="secondary">{certificate.issuer}</Badge>
                                                </div>
                                                {certificate.issue_date && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Issued: {new Date(certificate.issue_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                                {certificate.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {certificate.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCertificateEdit(certificate)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleCertificateDelete(certificate.id || "-1")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Projects Management Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Projects</h2>
                            <Button
                                onClick={() => setIsAddingNew(true)}
                                className="gradient-primary"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Project
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {(isAddingNew || editingProject) && (
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle>{editingProject ? "Edit Project" : "Add New Project"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...projectForm}>
                                    <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                                        <FormField
                                            control={projectForm.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter project title" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={projectForm.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <TextArea placeholder="Enter project description" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={projectForm.control}
                                            name="image"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Image</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-2">
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleProjectImageUpload}
                                                                className="cursor-pointer"
                                                            />
                                                            {(field.value || projectImageFile) && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {projectImageFile ? (
                                                                        <span className="text-orange-600">File selected: {projectImageFile.name}</span>
                                                                    ) : (
                                                                        <span className="text-primary">Current image uploaded</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={projectForm.control}
                                            name="technologies"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Technologies</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="React, TypeScript, Tailwind (comma-separated)" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={projectForm.control}
                                            name="demo_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Demo URL (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter demo URL" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={projectForm.control}
                                            name="github_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GitHub URL (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter GitHub repository URL" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex gap-2">
                                            <Button type="submit" className="gradient-primary" disabled={loading}>
                                                <Save className="w-4 h-4 mr-2" />
                                                {loading ? "Saving..." : "Save Project"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleProjectCancel}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}

                    {projects.map((project) => (
                        <Card key={project.id} className="shadow-card">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{project.title}</CardTitle>
                                        <CardDescription>{project.description}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleProjectEdit(project)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleProjectDelete(project.id || "-1")}
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Admin;