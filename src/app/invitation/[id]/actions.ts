'use server'

import { apiWithAuth } from '@/lib/axios'
import { Classroom } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'

export async function acceptInvitation(id: string): Promise<
    ActionResponse<{
        classroom: Classroom
    }>
> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                classroom: Classroom
            }>
        >(`/classroom/invitation/${id}`)

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        console.log(e.response.data)
        return {
            success: false,
            message: e.response.data.message,
            error: e.response.data.error,
        }
    }
}
