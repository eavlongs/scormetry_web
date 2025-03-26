'use server'

import { apiWithAuth } from '@/lib/axios'
import { Classroom, ColorType } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'

export async function createClassroom(
    name: string,
    color: ColorType
): Promise<
    ActionResponse<{
        classroom: Classroom
    }>
> {
    try {
        const response = await apiWithAuth.post<
            ApiResponse<{
                classroom: Classroom
            }>
        >('/classroom', {
            name,
            color,
        })

        revalidatePath('/')

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

export async function getClassrooms(): Promise<{
    teaching_classrooms: Classroom[]
    studying_classrooms: Classroom[]
    judging_classrooms: Classroom[]
}> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                teaching_classrooms: Classroom[]
                studying_classrooms: Classroom[]
                judging_classrooms: Classroom[]
            }>
        >('/classroom')

        return { ...response.data.data }
    } catch (e: any) {
        return {
            teaching_classrooms: [],
            studying_classrooms: [],
            judging_classrooms: [],
        }
    }
}

export async function revalidateData(path: string) {
    revalidatePath(path)
}
