'use server'

import { apiWithAuth } from '@/lib/axios'
import { Classroom, ClassroomRole, ColorType } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'

export type GetClassroomResponse = {
    classroom: Classroom
    role: ClassroomRole
}

export async function getClassroom(
    id: string
): Promise<GetClassroomResponse | null> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<GetClassroomResponse>
        >(`/classroom/${id}`)

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
