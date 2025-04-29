'use server'

import { apiWithAuth } from '@/lib/axios'
import { getValidationErrorActionResponse } from '@/lib/utils'
import { GroupingSchema } from '@/schema'
import { Grouping } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'

export async function createGrouping(
    classroom_id: string,
    name: string,
    description: string
): Promise<
    ActionResponse<{
        grouping: Grouping
    }>
> {
    try {
        const data = GroupingSchema.parse({
            name,
            description,
        })

        const response = await apiWithAuth.post<
            ApiResponse<{ grouping: Grouping }>
        >(`/classroom/${classroom_id}/grouping`, data)

        revalidatePath(`/classroom/${classroom_id}/groupings`)
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

export async function updateGrouping(
    grouping_id: string,
    name: string,
    description: string,
    classroom_id: string
): Promise<
    ActionResponse<{
        grouping: Grouping
    }>
> {
    try {
        const data = GroupingSchema.parse({
            name,
            description,
        })

        const response = await apiWithAuth.patch<
            ApiResponse<{ grouping: Grouping }>
        >(`/grouping/${grouping_id}`, data)

        revalidatePath(`/classroom/${classroom_id}/groupings`)
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

export async function deleteGrouping(
    grouping_id: string,
    classroom_id: string
): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.delete<ApiResponse>(
            `/grouping/${grouping_id}`
        )

        revalidatePath(`/classroom/${classroom_id}/groupings`)
        return {
            success: true,
            message: response.data.message,
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
