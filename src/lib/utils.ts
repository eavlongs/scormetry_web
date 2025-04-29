import { classroomColorsWithType } from '@/types/classroom'
import {
    ActionResponse,
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
export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    } catch (err) {
        console.log(err)
        toast.error('Failed to copy')
    }
}

export async function copyUrlToClipboard(path: string) {
    const hostname = window.location.hostname
    const port = window.location.port

    let url = ''
    if (port != '80' && port != '443') {
        url = `${hostname}:${port}${path}`
    } else {
        url = `${hostname}${path}`
    }

    await copyToClipboard(url)
}

export function convertZodErrorToValidationError<T>(
    err: ZodError<T>
): ValidationError[] {
    if (!(err instanceof ZodError)) return []

    const issues = err.issues
    const validationErrors: ValidationError[] = []

    for (const i in issues) {
        const path = issues[i].path

        if (!path) {
            validationErrors.push({
                field: i + 1,
                message: issues[i].message,
            })
            continue
        }

        let field = path[path.length - 1].toString()

        for (let i = path.length - 1; i >= 0; i--) {
            if (typeof path[i] === 'string') {
                field = path[i] as string
            }
        }

        validationErrors.push({
            field,
            message: issues[i].message,
        })
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

export function getValidationErrorMessage(e: ValidationError[]): string {
    return e.length > 0 ? e[0].message : ''
}

export function preventNonNumericInput(
    e: React.KeyboardEvent<HTMLInputElement>
) {
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        return
    }
}

export function limitFloatInputDecimalPlaces(
    e: React.KeyboardEvent<HTMLInputElement>,
    ref: React.RefObject<HTMLInputElement | null>,
    maxDecimalPlaces: number
) {
    if (!ref.current) {
        return
    }

    const input = ref.current.value

    const decimalPointIndex = input.indexOf('.')

    if (decimalPointIndex === -1) {
        return
    }

    if (input.length - decimalPointIndex > maxDecimalPlaces) {
        e.preventDefault()
    }
}
