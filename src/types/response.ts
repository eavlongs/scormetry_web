export type ApiResponse<T = any, U = ValidationError[]> = {
    success: boolean
    message: string
    error?: U
    data?: T
}

export type ValidationError = {
    field: string
    message: string
}

export const VALIDATION_ERROR = 'validation'
export const VALIDATION_ERROR_MESSAGE = 'Validation Error'

export type ActionResponse<T = any, U = ValidationError[]> = {
    success: boolean
    message: string
    data?: T
    error?: U
}

export const KEYOF_ERR_NOT_INTENDED_USER_FOR_INVITATION =
    'not_intended_user_for_invitation'
export const KEYOF_ERR_USER_ALREADY_IN_CLASSROOM = 'user_already_in_classroom'
