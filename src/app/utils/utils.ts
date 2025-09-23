import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const isOnVercelEnv = (): boolean => {
    console.log('VERCEL:', process.env.VERCEL);
    return process.env.VERCEL === '1';
}