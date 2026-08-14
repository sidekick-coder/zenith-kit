
import { clsx as originalClsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge as originalTwMerge, type ClassNameValue } from 'tailwind-merge'

export function twMerge(...inputs: ClassNameValue[]) {
    return originalTwMerge(inputs)
}

export function clsx(...inputs: ClassValue[]) {
    return originalClsx(inputs)
}

export function cn(...inputs: ClassValue[]) {
    return originalTwMerge(originalClsx(inputs))
}
