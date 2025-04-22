'use server'

import { apiWithAuth } from '@/lib/axios'
import { getValidationErrorActionResponse } from '@/lib/utils'
import { CategorySchema } from '@/schema'
import { Category } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'

export async function createCategory(
    classroom_id: string,
    name: string,
    score_percentage: number
): Promise<
    ActionResponse<{
        category: Category
    }>
> {
    try {
        const data = CategorySchema.parse({
            name: name,
            score_percentage: score_percentage,
        })

        const response = await apiWithAuth.post<
            ApiResponse<{
                category: Category
            }>
        >(`/classroom/${classroom_id}/category`, data)

        revalidatePath(`/classroom/${classroom_id}/categories`)

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

export async function updateCategory(
    category_id: string,
    name: string,
    score_percentage: number,
    classroom_id: string
): Promise<ActionResponse> {
    try {
        const data = CategorySchema.parse({
            name: name,
            score_percentage: score_percentage,
        })

        const response = await apiWithAuth.patch<ApiResponse>(
            `/category/${category_id}`,
            data
        )

        revalidatePath(`/classroom/${classroom_id}/categories`)

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

export async function deleteCategory(
    category_id: string,
    classroom_id: string
): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.delete<ApiResponse>(
            `/category/${category_id}`
        )

        revalidatePath(`/classroom/${classroom_id}/categories`)

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
