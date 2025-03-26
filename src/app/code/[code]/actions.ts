'use server'

import { apiWithAuth } from '@/lib/axios'
import { Classroom } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'

export async function joinClassroomByCode(code: string): Promise<
    ActionResponse<
        {
            classroom: Classroom
        },
        {
            type: string
        }
    >
> {
    try {
        const response = await apiWithAuth.post<
            ApiResponse<
                {
                    classroom: Classroom
                },
                {
                    type: string
                }
            >
        >(`/classroom/code/${code}`)

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        return {
            success: false,
            message: e.response.data.message,
            error: e.response.data.error,
            data: e.response.data.data,
        }
    }
}
