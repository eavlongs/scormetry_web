'use server'

import { apiWithAuth } from '@/lib/axios'
import { getValidationErrorActionResponse } from '@/lib/utils'
import { ClassroomSchema } from '@/schema'
import { Classroom, ColorType } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'

export async function createClassroom(
    name: string,
    color: ColorType
): Promise<
    ActionResponse<{
        classroom: Classroom
    }>
> {
    try {
        const data = ClassroomSchema.parse({
            name,
            color,
        })

        const response = await apiWithAuth.post<
            ApiResponse<{
                classroom: Classroom
            }>
        >('/classroom', data)

        revalidatePath('/')

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        if (e instanceof ZodError) {
            return getValidationErrorActionResponse(e)
        }

        return {
            success: false,
            message: e.response.data.message,
            error: e.response?.data?.error,
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

        return { ...response.data.data! }
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
