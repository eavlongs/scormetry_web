'use server'

import { apiWithAuth } from '@/lib/axios'
import { getValidationErrorActionResponse } from '@/lib/utils'
import { ActivitySchema } from '@/schema'
import { GetRubricInClassroomResponse } from '@/types/classroom'
import { ApiResponse } from '@/types/response'
import { ZodError } from 'zod'

export async function createActivity(classroomId: string, formData: FormData) {
    try {
        ActivitySchema.parse(Object.fromEntries(formData))

        const response = await apiWithAuth.post<ApiResponse<{ activity: any }>>(
            `/classroom/${classroomId}/activity`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        if (e instanceof ZodError) {
            console.log(e)
            return getValidationErrorActionResponse(e)
        }

        return {
            success: false,
            message: e.response.data.message,
            error: e.response?.data?.error,
        }
    }
}

export async function getRubricsInClassroom(
    classroomId: string
): Promise<GetRubricInClassroomResponse[]> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{ rubrics: GetRubricInClassroomResponse[] }>
        >(`/classroom/${classroomId}/rubrics`)
        if (!response.data.data) {
            throw new Error('No rubrics found')
        }

        return response.data.data.rubrics
    } catch (e: any) {
        console.log(e.message ? e.message : e)
        return []
    }
}
