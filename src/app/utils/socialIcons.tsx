import { Github, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe, Mail, Phone } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const socialIcons: Record<string, LucideIcon> = {
    Github,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    Website: Globe,
    Email: Mail,
    Phone,
};

export const socialPlatforms = [
    "Github",
    "Linkedin",
    "Twitter",
    "Facebook",
    "Instagram",
    "Youtube",
    "Website",
    "Email",
    "Phone",
];

export const getSocialIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Globe;
    return socialIcons[iconName] || Globe;
};
