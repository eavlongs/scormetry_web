'use server'

import { GetClassroomResponse } from '@/app/(with_navbar)/classroom/[id]/actions'
import { apiWithAuth } from '@/lib/axios'
import { getValidationErrorActionResponse } from '@/lib/utils'
import { ActivitySchema } from '@/schema'
import { Activity, GetActivity } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { ZodError } from 'zod'

export async function editActivity(
    activityId: string,
    formData: FormData
): Promise<
    ActionResponse<{
        activity: Activity
    }>
> {
    try {
        ActivitySchema.parse(Object.fromEntries(formData))

        const response = await apiWithAuth.patch<
            ApiResponse<{ activity: Activity }>
        >(`/activity/${activityId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

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
