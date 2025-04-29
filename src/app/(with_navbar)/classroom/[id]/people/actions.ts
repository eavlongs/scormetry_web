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
            return {
                success: false,
                message: e.message,
                error: convertZodErrorToValidationError(e),
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
    classroomId: string,
    userId: string
): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.delete<ApiResponse>(
            `/classroom/${classroomId}/user/${userId}`
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
