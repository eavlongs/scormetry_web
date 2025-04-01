import { classroomColorsWithType } from '@/types/classroom'
import {
    ActionResponse,
    VALIDATION_ERROR,
    VALIDATION_ERROR_MESSAGE,
    ValidationError,
} from '@/types/response'
import { clsx, type ClassValue } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getRandomColor() {
    return classroomColorsWithType[
        Math.floor(Math.random() * classroomColorsWithType.length)
    ]
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
        console.log(err)
        toast.error('Failed to copy')
    }
}

export function convertZodErrorToValidationError<T>(
    err: ZodError<T>
): ValidationError[] {
    if (!(err instanceof ZodError)) return []

    const formattedErrors = err.format()
    const validationErrors: ValidationError[] = []

    // Handle root level errors
    for (const key in formattedErrors) {
        if (key === '_errors') continue

        const fieldError = formattedErrors[key as keyof typeof formattedErrors]

        // Check if fieldError is an object first before using 'in' operator
        if (
            fieldError &&
            typeof fieldError === 'object' &&
            fieldError !== null &&
            '_errors' in fieldError &&
            Array.isArray(fieldError._errors) &&
            fieldError._errors.length > 0
        ) {
            validationErrors.push({
                field: key,
                message: fieldError._errors[0] || 'Invalid input',
            })
        }
    }

    return validationErrors
}

export function getErrorMessageFromValidationError(
    e: ValidationError[],
    key: string | string[]
): string {
    if (Array.isArray(key)) {
        const error = e.find((error) => key.includes(error.field))
        if (error) {
            return error.message
        }
        return ''
    }

    const error = e.find((error) => error.field === key)
    if (error) {
        return error.message
    }
    return ''
}

export function getKeysFromValidationError(e: ValidationError[]): string[] {
    return e.map((error) => error.field)
}

export function getValidationErrorActionResponse<T>(
    err: ZodError<T>
): ActionResponse {
    return {
        success: false,
        message: VALIDATION_ERROR_MESSAGE,
        error: convertZodErrorToValidationError(err),
    }
}
