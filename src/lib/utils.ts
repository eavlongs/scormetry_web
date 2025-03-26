import { classroomColors } from '@/types/classroom'
import { clsx, type ClassValue } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getRandomColor() {
    return classroomColors[Math.floor(Math.random() * classroomColors.length)]
}

/**
   client side only
*/
export async function copyUrlToClipboard(path: string) {
    try {
        const hostname = window.location.hostname
        const port = window.location.port

        let url = ''
        if (port != '80' && port != '443') {
            url = `${hostname}:${port}${path}`
        } else {
            url = `${hostname}${path}`
        }

        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
    } catch (err) {
        toast.error('Failed to copy')
    }
}
