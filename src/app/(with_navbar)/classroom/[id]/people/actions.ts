'use server'

import { apiWithAuth } from '@/lib/axios'
import { ActionResponse, ApiResponse } from '@/types/response'

export async function deleteClassroomUser(
    userId: string
): Promise<ActionResponse> {
    try {
        const response = await apiWithAuth.delete<ApiResponse>(
            `/classroom/user/${userId}`
        )

        return {
            success: true,
            message: response.data.message,
        }
    } catch (e: any) {
        return {
            success: false,
            message: e.response?.data?.message,
        }
    }
}
