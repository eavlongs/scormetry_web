'use server'

import { apiWithAuth } from '@/lib/axios'
import { Classroom, ColorType } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'

export async function createClassroom(
    name: string,
    color: ColorType
): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.post<ApiResponse>('/classroom', {
            name,
            color,
        })

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

export async function getClassrooms(): Promise<Classroom[]> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                classrooms: Classroom[]
            }>
        >('/classroom')

        return response.data.data.classrooms
    } catch (e: any) {
        return []
    }
}
