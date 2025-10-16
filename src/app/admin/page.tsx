'use client'

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { TextArea } from "../components/ui/textArea";
import { Plus, Edit2, Save } from "lucide-react";
import { useToast } from "../utils/hooks/useToast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { supabase } from "../services/supabase/client";
import { Profile, Project, Projects, Skill, Skills, Certificate, Certificates, SocialLink, SocialLinks } from "../services/models";
import {
    addCertificate,
    addProject,
    addSkill,
    addSocialLink,
    deleteCertificateById,
    deleteProjectById,
    deleteSkillById,
    deleteSocialLinkById,
    getCertificates,
    getProfile,
    getProjects,
    getSkills,
    getSocialLinks,
    updateCertificateById,
    updateCertificateDisplayOrder,
    updateProfile,
    updateProjectById,
    updateProjectDisplayOrder,
    updateSkillById,
    updateSkillDisplayOrder,
    updateSocialLinkById,
    updateSocialLinkDisplayOrder,
    uploadFile
} from "../services/api";
import { Toaster } from "../components/ui/toaster";
import { localStorageUtil } from "../utils/localStorageUtil";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AdminNavigation, LoadingOverlay } from "../components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getSkillIcon, SkillTypeList } from "../utils/skillIcons";
import { SortableCertificateItem, SortableProjectItem, SortableSkillItem, SortableSocialLinkItem } from "./sortable-item";
import { CertificateForm, ProfileForm, ProjectForm, SkillForm, SocialLinkForm } from "./form-interface";
import { isOnVercelEnv } from "../utils/utils";
import { handleAxiosError } from "../services/axios";
import { getSocialIcon, socialPlatforms } from "../utils/socialIcons";

const Admin = () => {
    const { toast } = useToast();
    const navigate = useRouter();
    const [projects, setProjects] = useState<Projects>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLinks>([]);
    const [skills, setSkills] = useState<Skills>([]);
    const [certificates, setCertificates] = useState<Certificates>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
    const [isAddingNewProject, setIsAddingNewProject] = useState(false);
    const [isAddingNewSkill, setIsAddingNewSkill] = useState(false);
    const [isAddingNewCertificate, setIsAddingNewCertificate] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isAddingNewSocialLink, setIsAddingNewSocialLink] = useState(false);
    const [editingSocialLink, setEditingSocialLink] = useState<SocialLink | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // File states for delayed upload
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
    const [certificateImageFile, setCertificateImageFile] = useState<File | null>(null);

    // Preview states for images
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [projectImagePreview, setProjectImagePreview] = useState<string | null>(null);
    const [certificateImagePreview, setCertificateImagePreview] = useState<string | null>(null);

    // Refs for scrolling
    const profileRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const socialLinksRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const projectsRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const skillsRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const certificatesRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

    const profileFormRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const socialLinkFormRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const projectFormRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const skillFormRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const certificateFormRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

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

    const profileForm = useForm<ProfileForm>({
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

    const socialLinkForm = useForm<SocialLinkForm>({
        defaultValues: {
            platform: "",
            url: "",
            icon: "Github",
        },
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const checkAuthAndFetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                localStorageUtil.removeItem('adminLoginTime');
                navigate.replace("/admin-login");
            } else {
                fetchData();

                // Check if login time exists and calculate remaining time
                if (isOnVercelEnv()) {
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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    const fetchProfile = async () => {
        try {
            await getProfile().then((res) => {
                if (res.status === 200) {
                    const profileData = res.data;
                    setProfile(profileData);
                    profileForm.reset({
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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    const fetchSocialLinks = async () => {
        try {
            await getSocialLinks().then((res) => {
                if (res.status === 200) {
                    setSocialLinks(res.data);
                }
            });
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    const onProfileSubmit = async (data: ProfileForm) => {
        setIsLoading(true);
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
                id: profile?.id || "-1",
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
                        description: "Profile updated successfully.",
                    });
                } else {
                    throw new Error(res.message);
                }
            })

            setIsEditingProfile(false);
            setAvatarFile(null);
            setCoverFile(null);
            // Clean up preview URLs
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
            if (coverPreview) URL.revokeObjectURL(coverPreview);
            setAvatarPreview(null);
            setCoverPreview(null);
            fetchProfile();
            onScrollToProfile();
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    const onScrollToProfile = () => setTimeout(() => {
        profileFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const onSocialLinkSubmit = async (data: SocialLinkForm) => {
        setIsLoading(true);
        try {
            if (editingSocialLink) {
                // Update existing social link

                await updateSocialLinkById({
                    id: editingSocialLink.id,
                    platform: data.platform,
                    url: data.url,
                    icon: data.icon || null,
                }).then((res) => {
                    console.log(res)
                    if (res.status == 200) {
                        toast({
                            title: "Success!",
                            description: "Social link updated successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                })
            } else {
                // Create new social link with highest order
                await addSocialLink({
                    id: "",
                    about_me_id: profile?.id,
                    platform: data.platform,
                    url: data.url,
                    icon: data.icon || null,
                }).then((res) => {
                    if (res.status == 200) {
                        toast({
                            title: "Success!",
                            description: "Social link created successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                });
            }

            socialLinkForm.reset({
                platform: "",
                url: "",
                icon: "Github",
            });
            setEditingSocialLink(null);
            setIsAddingNewSocialLink(false);
            fetchSocialLinks();
            onScrollToSocialLinks();
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    const handleSocialLinkEdit = (socialLink: SocialLink) => {
        setEditingSocialLink(socialLink);
        socialLinkForm.reset({
            platform: socialLink.platform,
            url: socialLink.url,
            icon: socialLink.icon || "Github",
        });
        setIsAddingNewSocialLink(true);
        onScrollToSocialLinks();
    };

    const handleSocialLinkDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this social link?")) return;

        try {
            await deleteSocialLinkById(id).then((res) => {
                if (res.status === 200) {
                    toast({
                        title: "Success!",
                        description: "Social link deleted successfully.",
                    });
                } else {
                    throw new Error(res.message);
                }
            })

            fetchSocialLinks();
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    const handleSocialLinkCancel = () => {
        socialLinkForm.reset({
            platform: "",
            url: "",
            icon: "Github",
        });
        setEditingSocialLink(null);
        setIsAddingNewSocialLink(false);
        onScrollToSocialLinks();
    };

    const handleSocialLinkDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = socialLinks.findIndex((link) => link.id === active.id);
        const newIndex = socialLinks.findIndex((link) => link.id === over.id);

        const newSocialLinks = arrayMove(socialLinks, oldIndex, newIndex);
        setSocialLinks(newSocialLinks);

        // Update display_order in database
        try {
            await updateSocialLinkDisplayOrder(newSocialLinks).then((res) => {
                if (res.status == 200) {
                    toast({
                        title: "Success!",
                        description: "Social link order updated successfully.",
                    });
                } else {
                    throw new Error(res.message);
                }
            })
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
            // Revert on error
            fetchSocialLinks();
        }
    };

    const onScrollToSocialLinks = () => setTimeout(() => {
        socialLinkFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const onProjectSubmit = async (data: ProjectForm) => {
        setIsLoading(true);
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

            projectForm.reset({
                title: "",
                description: "",
                image: "",
                technologies: "",
                demo_url: "",
                github_url: "",
            });
            setEditingProject(null);
            setIsAddingNewProject(false);
            setProjectImageFile(null);
            // Clean up preview URL
            if (projectImagePreview) URL.revokeObjectURL(projectImagePreview);
            setProjectImagePreview(null);
            fetchProjects();
            onScrollToProject();
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
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
        setIsAddingNewProject(true);
        onScrollToProject();
    };

    const handleProjectDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    const handleProjectCancel = () => {
        projectForm.reset({
            title: "",
            description: "",
            image: "",
            technologies: "",
            demo_url: "",
            github_url: "",
        });
        setEditingProject(null);
        setIsAddingNewProject(false);
        setProjectImageFile(null);
        // Clean up preview URL
        if (projectImagePreview) URL.revokeObjectURL(projectImagePreview);
        setProjectImagePreview(null);
        onScrollToProject();
    };

    const handleProjectDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = projects.findIndex((proj) => proj.id === active.id);
        const newIndex = projects.findIndex((proj) => proj.id === over.id);

        const newProjects: Projects = arrayMove(projects, oldIndex, newIndex);
        setProjects(newProjects);

        // Update display_order in database
        try {
            await updateProjectDisplayOrder(newProjects).then((res) => {
                if (res.status == 200) {
                    toast({
                        title: "Success!",
                        description: "Project order updated successfully.",
                    });
                } else {
                    throw new Error(res.message);
                }
            })
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
            // Revert on error
            fetchProjects();
        }
    };

    const onScrollToProject = () => setTimeout(() => {
        projectFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const handleSkillEdit = (skill: Skill) => {
        setEditingSkill(skill);
        skillForm.reset({
            name: skill.name,
            level: skill.level,
            icon: skill.icon || "Code",
            display_order: skill.display_order || 0,
        });
        setIsAddingNewSkill(true);
        onScrollToSkill();
    };

    const handleSkillDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this skill?")) return;

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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    const handleSkillCancel = () => {
        skillForm.reset({
            name: "",
            level: 50,
            icon: "Code",
        });
        setEditingSkill(null);
        setIsAddingNewSkill(false);
        onScrollToSkill();
    };

    const onSkillSubmit = async (data: SkillForm) => {
        setIsLoading(true);
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
            skillForm.reset({
                name: "",
                level: 50,
                icon: "Code",
            });
            setEditingSkill(null);
            setIsAddingNewSkill(false);
            fetchSkills();
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    const handleSkillDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = skills.findIndex((skill) => skill.id === active.id);
            const newIndex = skills.findIndex((skill) => skill.id === over.id);

            const newSkills: Skills = arrayMove(skills, oldIndex, newIndex);
            setSkills(newSkills);

            // Update display_order in database
            try {
                await updateSkillDisplayOrder(newSkills).then((res) => {
                    if (res.status == 200) {
                        toast({
                            title: "Order Updated",
                            description: "Skill order saved successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                })
            } catch (error) {
                const err = handleAxiosError(error);
                toast({
                    title: "Error",
                    description: err ? err.message : "Something went wrong.",
                    variant: "destructive",
                });
                fetchSkills(); // Revert to original order
            }
        }
    };

    const onScrollToSkill = () => setTimeout(() => {
        skillFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100)

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
        setIsAddingNewCertificate(true);
        onScrollToCertificate();
    };

    const handleCertificateDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this certificate?")) return;

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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    const handleCertificateCancel = () => {
        certificateForm.reset({
            title: "",
            issuer: "",
            image: "",
            certificate_url: "",
            issue_date: "",
            description: "",
            display_order: 0,
        });
        setEditingCertificate(null);
        setIsAddingNewCertificate(false);
        setCertificateImageFile(null);
        // Clean up preview URL
        if (certificateImagePreview) URL.revokeObjectURL(certificateImagePreview);
        setCertificateImagePreview(null);
        onScrollToCertificate();
    };

    const onCertificateSubmit = async (data: CertificateForm) => {
        setIsLoading(true);
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

            certificateForm.reset({
                title: "",
                issuer: "",
                image: "",
                certificate_url: "",
                issue_date: "",
                description: "",
                display_order: 0,
            });
            setEditingCertificate(null);
            setIsAddingNewCertificate(false);
            setCertificateImageFile(null);
            // Clean up preview URL
            if (certificateImagePreview) URL.revokeObjectURL(certificateImagePreview);
            setCertificateImagePreview(null);
            fetchCertificates();
        } catch (error) {
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    const handleCertificateDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = certificates.findIndex((cert) => cert.id === active.id);
            const newIndex = certificates.findIndex((cert) => cert.id === over.id);

            const newCertificates = arrayMove(certificates, oldIndex, newIndex);
            setCertificates(newCertificates);

            // Update display_order in database
            try {
                await updateCertificateDisplayOrder(newCertificates).then((res) => {
                    if (res.status == 200) {
                        toast({
                            title: "Order Updated",
                            description: "Certificate order saved successfully.",
                        });
                    } else {
                        throw new Error(res.message);
                    }
                })
            } catch (error) {
                const err = handleAxiosError(error);
                toast({
                    title: "Error",
                    description: err ? err.message : "Something went wrong.",
                    variant: "destructive",
                });
                fetchCertificates(); // Revert to original order
            }
        }
    };

    const onScrollToCertificate = () => setTimeout(() => {
        certificateFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
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
            const err = handleAxiosError(error);
            toast({
                title: "Error",
                description: err ? err.message : "Something went wrong.",
                variant: "destructive",
            });
            return null;
        }
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAvatarFile(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
    };

    const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setCoverFile(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setCoverPreview(previewUrl);
    };

    const handleProjectImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setProjectImageFile(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setProjectImagePreview(previewUrl);
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

        // Create preview URL (only for images)
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            setCertificateImagePreview(previewUrl);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Toaster />
            <LoadingOverlay isLoading={isLoading} />

            {/* Fixed Navigation */}
            <AdminNavigation
                profileRef={profileRef}
                socialLinksRef={socialLinksRef}
                skillsRef={skillsRef}
                projectsRef={projectsRef}
                certificatesRef={certificatesRef}
                handleLogout={handleLogout}
            />

            <div className="container mx-auto px-6 py-24">
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Manage portfolio projects and contents</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8 space-y-6">
                    {/* Profile Management Section */}
                    <div ref={profileRef} className="scroll-mt-24">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Profile</h2>
                            {
                                !isEditingProfile &&
                                <Button
                                    onClick={() => {
                                        setIsEditingProfile(true);
                                        onScrollToProfile();
                                    }}
                                    className="gradient-primary"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </Button>
                            }
                        </div>

                        {profile && !isEditingProfile && (
                            <Card ref={profileFormRef} className="shadow-card scroll-mt-24">
                                <CardHeader>
                                    <CardTitle>{profile.title}</CardTitle>
                                    <CardDescription>{profile.name} - {profile.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-1"><strong>Bio:</strong> {profile.bio}</p>
                                    {profile.avatar_url && (
                                        <Image src={profile.avatar_url} width={24} height={24} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-2" />
                                    )}
                                    {profile.cover_image && (
                                        <Image src={profile.cover_image} width={1000} height={48} alt="Cover" priority className="w-full h-48 rounded mb-2 object-cover" />
                                    )}
                                    <p className="mb-1"><strong>Location:</strong> {profile.location}</p>
                                    <p className="mb-1"><strong>Email:</strong> {profile.email}</p>
                                    <p className="mb-1"><strong>Phone:</strong> {profile.phone}</p>
                                </CardContent>
                            </Card>
                        )}

                        {isEditingProfile && (
                            <Card className="shadow-card">
                                <CardHeader>
                                    <CardTitle>Edit Profile</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form {...profileForm}>
                                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={profileForm.control}
                                                    name="title"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Section Title</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Profile" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={profileForm.control}
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
                                                control={profileForm.control}
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
                                                control={profileForm.control}
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

                                            <div className="space-y-2">
                                                <FormField
                                                    control={profileForm.control}
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
                                                                    <div className="flex gap-4 mt-2">
                                                                        {profile?.avatar_url && (
                                                                            <div>
                                                                                <p className="text-xs text-muted-foreground mb-1">Current Avatar:</p>
                                                                                <Image src={profile.avatar_url} alt="Current Avatar" priority width={24} height={24} className="w-24 h-24 rounded-full object-cover border-2 border-border" />
                                                                            </div>
                                                                        )}
                                                                        {avatarPreview && (
                                                                            <div>
                                                                                <p className="text-xs text-muted-foreground mb-1">New Avatar:</p>
                                                                                <Image src={avatarPreview} alt="New Avatar Preview" priority width={24} height={24} className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <FormField
                                                    control={profileForm.control}
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
                                                                    <div className="flex flex-col gap-4 mt-2">
                                                                        {profile?.cover_image && (
                                                                            <div>
                                                                                <p className="text-xs text-muted-foreground mb-1">Current Cover:</p>
                                                                                <Image src={profile.cover_image} width={1000} height={32} alt="Current Cover" className="w-full max-w-md h-32 object-cover rounded border-2 border-border" />
                                                                            </div>
                                                                        )}
                                                                        {coverPreview && (
                                                                            <div>
                                                                                <p className="text-xs text-muted-foreground mb-1">New Cover:</p>
                                                                                <Image src={coverPreview} alt="New Cover Preview" width={1000} height={32} className="w-full max-w-md h-32 object-cover rounded border-2 border-primary" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={profileForm.control}
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
                                                    control={profileForm.control}
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
                                                    control={profileForm.control}
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

                                            <div className="flex gap-2">
                                                <Button type="submit" className="gradient-primary" disabled={isLoading}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {isLoading ? "Saving..." : "Save Profile"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsEditingProfile(false);
                                                        setAvatarFile(null);
                                                        setCoverFile(null);
                                                        // Clean up preview URLs
                                                        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                                                        if (coverPreview) URL.revokeObjectURL(coverPreview);
                                                        setAvatarPreview(null);
                                                        setCoverPreview(null);
                                                        profileForm.reset();
                                                        onScrollToProfile();
                                                    }}
                                                    disabled={isLoading}
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

                    {/* Social Links Management Section */}
                    <div ref={socialLinksRef} className="scroll-mt-24">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Social Links</h2>
                            <Button
                                onClick={() => {
                                    setIsAddingNewSocialLink(true);
                                    onScrollToSocialLinks();
                                }}
                                className="gradient-primary"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Social Link
                            </Button>
                        </div>

                        {(isAddingNewSocialLink || editingSocialLink) && (
                            <Card ref={socialLinkFormRef} className="shadow-card mb-4 scroll-mt-24">
                                <CardContent>
                                    <Form {...socialLinkForm}>
                                        <form onSubmit={socialLinkForm.handleSubmit(onSocialLinkSubmit)} className="space-y-4">
                                            <FormField
                                                control={socialLinkForm.control}
                                                name="platform"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Platform</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Platform Name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={socialLinkForm.control}
                                                name="url"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>URL</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={socialLinkForm.control}
                                                name="icon"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Icon</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select an icon" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {
                                                                    socialPlatforms.map((platform) => {
                                                                        const SocialIcon = getSocialIcon(platform);
                                                                        return (
                                                                            <SelectItem key={platform} value={platform}>
                                                                                <div className="flex flex-row">
                                                                                    <SocialIcon className="w-5 h-5 text-primary mr-2" />{platform}
                                                                                </div>
                                                                            </SelectItem>
                                                                        )
                                                                    })
                                                                }
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex gap-2">
                                                <Button type="submit" className="gradient-primary" disabled={isLoading}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {isLoading ? "Saving..." : "Save Social Link"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleSocialLinkCancel}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mb-2 text-sm text-muted-foreground">
                            💡 Drag and drop social links to reorder them
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleSocialLinkDragEnd}
                        >
                            <SortableContext
                                items={socialLinks.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="grid gap-4">
                                    {socialLinks.map((socialLink) => (
                                        <SortableSocialLinkItem
                                            key={socialLink.id}
                                            socialLink={socialLink}
                                            onEdit={handleSocialLinkEdit}
                                            onDelete={handleSocialLinkDelete}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Skills Management Section */}
                    <div ref={skillsRef} className="scroll-mt-24">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Skills</h2>
                            {
                                !isAddingNewSkill &&
                                <Button
                                    onClick={() => {
                                        setIsAddingNewSkill(true);
                                        onScrollToSkill();
                                    }}
                                    className="gradient-primary"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Skill
                                </Button>
                            }
                        </div>

                        {(isAddingNewSkill || editingSkill) && (
                            <Card ref={skillFormRef} className="shadow-card mb-4 scroll-mt-24">
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
                                            <FormField
                                                control={skillForm.control}
                                                name="icon"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Icon Name</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select an icon" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {
                                                                    SkillTypeList.map((item) => {
                                                                        const SkillIcon = getSkillIcon(item);
                                                                        return (
                                                                            <SelectItem key={item} value={item}>
                                                                                <div className="flex flex-row">
                                                                                    <SkillIcon className="w-5 h-5 text-primary mr-2" />{item}
                                                                                </div>
                                                                            </SelectItem>
                                                                        )
                                                                    })
                                                                }
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex gap-2">
                                                <Button type="submit" className="gradient-primary" disabled={isLoading}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {isLoading ? "Saving..." : "Save Skill"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleSkillCancel}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mb-2 text-sm text-muted-foreground">
                            💡 Drag and drop skills to reorder them
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleSkillDragEnd}
                        >
                            <SortableContext
                                items={skills.map(s => s.id || "-1")}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="grid gap-4">
                                    {skills.map((skill) => (
                                        <SortableSkillItem
                                            key={skill.id}
                                            skill={skill}
                                            onEdit={handleSkillEdit}
                                            onDelete={handleSkillDelete}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Projects Management Section */}
                    <div ref={projectsRef} className="scroll-mt-24">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Projects</h2>
                            {
                                !isAddingNewProject &&
                                <Button
                                    onClick={() => {
                                        setIsAddingNewProject(true);
                                        onScrollToProject();
                                    }}
                                    className="gradient-primary"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Project
                                </Button>
                            }
                        </div>

                        {(isAddingNewProject || editingProject) && (
                            <Card ref={projectFormRef} className="shadow-card mb-4 scroll-mt-24">
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
                                                        <FormLabel>Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Project Title" {...field} />
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
                                                            <TextArea placeholder="Project Description" {...field} />
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
                                                        <FormLabel>Technologies (comma separated)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="React, TypeScript, Node.js" {...field} />
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
                                                        <FormLabel>Demo URL</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://demo.example.com" {...field} />
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
                                                        <FormLabel>GitHub URL</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://github.com/username/repo" {...field} />
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
                                                                    accept="image/*f"
                                                                    onChange={handleProjectImageUpload}
                                                                    className="cursor-pointer"
                                                                />
                                                                {(field.value || projectImageFile) && (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {projectImageFile ? (
                                                                            <span className="text-orange-600">File selected: {projectImageFile.name}</span>
                                                                        ) : (
                                                                            <span className="text-primary">Current file uploaded</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col gap-4 mt-2">
                                                                    {editingProject?.image && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground mb-1">Current Image:</p>
                                                                            <Image src={editingProject.image} alt="Current Project" width={1000} height={48} className="w-full max-w-md h-48 object-cover rounded border-2 border-border" />
                                                                        </div>
                                                                    )}
                                                                    {projectImagePreview && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground mb-1">New Image:</p>
                                                                            <Image src={projectImagePreview} width={1000} height={48} alt="New Project Preview" className="w-full max-w-md h-48 object-cover rounded border-2 border-primary" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex gap-2">
                                                <Button type="submit" className="gradient-primary" disabled={isLoading}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {isLoading ? "Saving..." : "Save Project"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleProjectCancel}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mb-2 text-sm text-muted-foreground">
                            💡 Drag and drop projects to reorder them
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleProjectDragEnd}
                        >
                            <SortableContext
                                items={projects.map(p => p.id || "-1")}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="grid gap-4">
                                    {projects.map((project) => (
                                        <SortableProjectItem
                                            key={project.id}
                                            project={project}
                                            onEdit={handleProjectEdit}
                                            onDelete={handleProjectDelete}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Certificates Management Section */}
                    <div ref={certificatesRef} className="scroll-mt-24">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Certificates</h2>
                            {
                                !isAddingNewCertificate &&
                                <Button
                                    onClick={() => {
                                        setIsAddingNewCertificate(true);
                                        onScrollToCertificate();
                                    }}
                                    className="gradient-primary"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Certificate
                                </Button>
                            }
                        </div>

                        {(isAddingNewCertificate || editingCertificate) && (
                            <Card ref={certificateFormRef} className="shadow-card mb-4 scroll-mt-24">
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
                                                                <div className="flex flex-col gap-4 mt-2">
                                                                    {editingCertificate?.image && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground mb-1">Current Image:</p>
                                                                            <Image src={editingCertificate.image} width={1000} height={48} alt="Current Certificate" className="w-full max-w-md h-48 object-cover rounded border-2 border-border" />
                                                                        </div>
                                                                    )}
                                                                    {certificateImagePreview && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground mb-1">New Image:</p>
                                                                            <Image src={certificateImagePreview} width={1000} height={48} alt="New Certificate Preview" className="w-full max-w-md h-48 object-cover rounded border-2 border-primary" />
                                                                        </div>
                                                                    )}
                                                                </div>
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

                                            <div className="flex gap-2">
                                                <Button type="submit" className="gradient-primary" disabled={isLoading}>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {isLoading ? "Saving..." : "Save Certificate"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCertificateCancel}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mb-2 text-sm text-muted-foreground">
                            💡 Drag and drop certificates to reorder them
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleCertificateDragEnd}
                        >
                            <SortableContext
                                items={certificates.map(c => c.id || "-1")}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="grid gap-4">
                                    {certificates.map((certificate) => (
                                        <SortableCertificateItem
                                            key={certificate.id}
                                            certificate={certificate}
                                            onEdit={handleCertificateEdit}
                                            onDelete={handleCertificateDelete}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;