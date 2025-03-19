import { apiWithAuth } from '@/lib/axios'
import { Classroom, ClassroomRole } from '@/types/classroom'
import { ApiResponse } from '@/types/response'

export type GetClassroomResponse = {
    classroom: Classroom
    role: ClassroomRole
}

export async function getClassroom(
    id: string
): Promise<GetClassroomResponse | null> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<GetClassroomResponse>
        >(`/classroom/${id}`)

        return {
            ...response.data.data,
        }
    } catch (e: any) {
        console.error(e.response.data)
        return null
    }
}
