'use server'

import { apiWithAuth } from '@/lib/axios'
import {
    Classroom,
    ClassroomRole,
    ClassroomUsersResponse,
    ColorType,
} from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'

export type GetClassroomResponse = {
    classroom: Classroom
    role: ClassroomRole
    people: ClassroomUsersResponse
}

export async function getClassroom(
    id: string
): Promise<GetClassroomResponse | null> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<GetClassroomResponse>
        >(`/classroom/${id}`)

        console.log({ response: response.data.data.people.students })
        return {
            ...response.data.data,
        }
    } catch (e: any) {
        console.error(e.response.data)
        return null
    }
}

export async function editClassroom(
    id: string,
    name: string,
    color: ColorType
): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.patch<ApiResponse>(
            `/classroom/${id}`,
            {
                name,
                color,
            }
        )

        revalidatePath('/')

        return {
            success: true,
            message: response.data.message,
        }
    } catch (e: any) {
        return {
            success: false,
            message: e.response.data.message,
        }
    }
}

export async function deleteClassroom(id: string): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.delete<ApiResponse>(
            `/classroom/${id}`
        )

        revalidatePath('/')

        return {
            success: true,
            message: response.data.message,
        }
    } catch (e: any) {
        return {
            success: false,
            message: e.response.data.message,
        }
    }
}

export async function inviteUsersToClassroom(
    classroomId: string,
    usersToInvite: {
        email: string
        role: ClassroomRole
    }[]
): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.post<
            ApiResponse<{
                invitations_sent: string[]
            }>
        >(`/classroom/invite/${classroomId}`, { users: usersToInvite })

        revalidatePath(`/classroom/${classroomId}/people`)
        return {
            success: true,
            message: response.data.message,
        }
    } catch (e: any) {
        console.log(e.response)
        return {
            success: false,
            message: e.response.data.message,
        }
    }
}

export async function regenerateClassroomCode(id: string): Promise<
    ActionResponse<{
        code: string
    }>
> {
    try {
        const response = await apiWithAuth.post<
            ApiResponse<{
                code: string
            }>
        >(`/classroom/${id}/generate-code`)

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        return {
            success: false,
            message: e.response.data.message,
        }
    }
}
