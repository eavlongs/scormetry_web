'use server'

import { apiWithAuth } from '@/lib/axios'
import { GetGradeResponse } from '@/types/classroom'
import { ApiResponse } from '@/types/response'

export async function getClassroomGrades(
    classroomId: string
): Promise<GetGradeResponse[]> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                grades: GetGradeResponse[]
            }>
        >(`/classroom/${classroomId}/grades`)

        return response.data.data?.grades ?? []
    } catch (e: any) {
        return []
    }
}
