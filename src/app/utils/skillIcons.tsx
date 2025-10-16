import { Cloud, Cpu, Database, GitBranch, Globe, Layers, Layout, Package, Palette, Server, Shield, Smartphone, Terminal, Zap } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const skillIcons: Record<string, LucideIcon> = {
    Database,
    Palette,
    Smartphone,
    Server,
    Globe,
    Terminal,
    GitBranch,
    Layout,
    Package,
    Cpu,
    Cloud,
    Shield,
    Zap,
    Layers,
};

export const SkillTypeList: string[] = [
    "Code",
    "Database",
    "Palette",
    "Smartphone",
    "Server",
    "Globe",
    "Terminal",
    "GitBranch",
    "Layout",
    "Package",
    "Cpu",
    "Cloud",
    "Shield",
    "Zap",
    "Layers",
];

export const getSkillIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Globe;
    return skillIcons[iconName] || Globe;
};