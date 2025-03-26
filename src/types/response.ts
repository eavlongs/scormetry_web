export type ApiResponse<T = any, U = any> = {
    success: boolean
    message: string
    error?: U
    data: T
}

export type ActionResponse<T = any, U = any> = {
    success: boolean
    message: string
    data?: T
    error?: U
}

export const KEYOF_ERR_NOT_INTENDED_USER_FOR_INVITATION =
    'not_intended_user_for_invitation'

export const KEYOF_ERR_USER_ALREADY_IN_CLASSROOM = 'user_already_in_classroom'
