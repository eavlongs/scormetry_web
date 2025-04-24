'use server'

import { apiWithAuth } from '@/lib/axios'
import { getValidationErrorActionResponse } from '@/lib/utils'
import { ActivitySchema } from '@/schema'
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
            return getValidationErrorActionResponse(e)
        }

        return {
            success: false,
            message: e.response.data.message,
            error: e.response?.data?.error,
        }
    }
}
