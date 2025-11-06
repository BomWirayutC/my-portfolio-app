import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs))
}

export const isOnVercelEnv = (): boolean => {
    return typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app");
}

export const isPdf = (url: string): boolean => {
    return url.toLowerCase().endsWith('.pdf');
}
