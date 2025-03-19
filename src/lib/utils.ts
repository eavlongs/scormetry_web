import { classroomColors } from '@/types/classroom'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getRandomColor() {
    return classroomColors[Math.floor(Math.random() * classroomColors.length)]
}
