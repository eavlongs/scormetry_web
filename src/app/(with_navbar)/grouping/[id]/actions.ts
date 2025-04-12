'use server'

import { apiWithAuth } from '@/lib/axios'
import { UserEssentialDetail } from '@/types/auth'
import { Classroom } from '@/types/classroom'
import { ApiResponse } from '@/types/response'

export type GetGroupingDetailResponse = {
    grouping: {
        id: string
        classroom_id: string
        name: string
        description: string
    }
    groups: {
        id: string
        name: string
        grouping_id: string
        students: UserEssentialDetail[]
    }[]
    available_students: UserEssentialDetail[]
    classroom: Classroom
}

export async function getgrouping(
    id: string
): Promise<GetGroupingDetailResponse | null> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<GetGroupingDetailResponse>
        >(`/grouping/${id}`)

        return {
            ...response.data.data!,
        }
    } catch (e: any) {
        console.error(e.response.data)
        return null
    }
}
