'use server'

import { apiWithAuth } from '@/lib/axios'
import { GetGradeResponse } from '@/types/classroom'
import { ApiResponse } from '@/types/response'

export async function GetMyGrades(
    classroomId: string
): Promise<GetGradeResponse | null> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                grades: GetGradeResponse
            }>
        >(`/classroom/${classroomId}/my-grades`)

        return response.data.data?.grades ?? null
    } catch (e: any) {
        return null
    }
}
