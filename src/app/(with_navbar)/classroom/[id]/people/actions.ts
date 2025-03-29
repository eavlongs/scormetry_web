'use server'

import { apiWithAuth } from '@/lib/axios'
import { convertZodErrorToValidationError } from '@/lib/utils'
import { InviteUsersToClassroomSchema } from '@/schema'
import { ClassroomRole } from '@/types/classroom'
import { ActionResponse, ApiResponse, ValidationError } from '@/types/response'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'

export async function inviteUsersToClassroom(
    classroomId: string,
    usersToInvite: {
        email: string
        role: ClassroomRole
    }[]
): Promise<ActionResponse> {
    try {
        const data = InviteUsersToClassroomSchema.parse({
            users: usersToInvite,
        })

        const response = await apiWithAuth.post<
            ApiResponse<{
                invitations_sent: string[]
            }>
        >(`/classroom/invite/${classroomId}`, data)

        revalidatePath(`/classroom/${classroomId}/people`)
        return {
            success: true,
            message: response.data.message,
        }
    } catch (e: any) {
        if (e instanceof ZodError) {
            // keep in mind the data type we are working with is
            // {
            //     "users": {
            //         "email: string",
            //         "role: ClassroomRole
            //     }[]
            // }

            // first check if "users" is valid

            const usersValidationError = convertZodErrorToValidationError(e)

            if (usersValidationError.length > 0) {
                return {
                    success: false,
                    message: e.message,
                    error: usersValidationError,
                }
            }

            // @ts-ignore
            const formattedErrors = (
                e as ZodError<typeof InviteUsersToClassroomSchema>
            ).format()
            const validationErrors: ValidationError[] = []

            // formattedErrors now looks like this:
            // {"_errors":[],"users":{"0":{"_errors":[],"email":{"_errors":["Please enter a valid email address"]}},"_errors":[]}}

            // @ts-ignore
            const usersError =
                formattedErrors['users' as keyof typeof formattedErrors]
            // now usersError should look like this:
            // {"0":{"_errors":[],"email":{"_errors":["Please enter a valid email address"]}},"_errors":[]}

            if (usersError && Object.keys(usersError).length > 0) {
                const firstError = usersError[
                    Object.keys(
                        usersError
                    )[0] as string as keyof typeof usersError
                ] as {
                    _errors: string[]
                    email?: {
                        _errors: string[]
                    }
                    role?: {
                        _errors: string[]
                    }
                }

                // now firstError should look like this:
                // {"_errors":[],"email":{"_errors":["Please enter a valid email address"]}}

                for (const key of Object.keys(firstError)) {
                    console.log({
                        key,
                        value: firstError[key as keyof typeof firstError],
                    })

                    const fieldError =
                        firstError[key as keyof typeof firstError]

                    // Check if fieldError is an object first before using 'in' operator
                    if (
                        key !== '_errors' &&
                        '_errors' in firstError &&
                        Array.isArray(firstError._errors) &&
                        fieldError &&
                        '_errors' in fieldError &&
                        fieldError._errors.length > 0
                    ) {
                        validationErrors.push({
                            field: key,
                            message:
                                (fieldError &&
                                    '_errors' in fieldError &&
                                    fieldError._errors?.[0]) ||
                                'Invalid input',
                        })
                    }
                }
            }

            return {
                success: false,
                message: e.message,
                error: validationErrors,
            }
        }
        return {
            success: false,
            message: e.response.data.message,
            error: e.response.data.error,
        }
    }
}

export async function deleteClassroomUser(
    userId: string
): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.delete<ApiResponse>(
            `/classroom/user/${userId}`
        )

        return {
            success: true,
            message: response.data.message,
        }
    } catch (e: any) {
        return {
            success: false,
            message: e.response?.data?.message,
        }
    }
}
