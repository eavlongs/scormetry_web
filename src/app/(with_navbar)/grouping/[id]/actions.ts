'use server'

import { apiWithAuth } from '@/lib/axios'
import {
    convertZodErrorToValidationError,
    getValidationErrorMessage,
} from '@/lib/utils'
import { GroupingCompositionSchema } from '@/schema'
import { UserEssentialDetail } from '@/types/auth'
import { Classroom } from '@/types/classroom'
import { ActionResponse, ApiResponse, ValidationError } from '@/types/response'
import { revalidatePath } from 'next/cache'
import { z, ZodError } from 'zod'

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

export async function saveGroupingComposition(
    groupingId: string,
    groups: GetGroupingDetailResponse['groups']
): Promise<ActionResponse<undefined, undefined>> {
    try {
        const formattedGroupsData = groups.map((group) => {
            return {
                id: group.id,
                name: group.name,
                students: group.students.map((student) => student.id),
            }
        })

        const data = GroupingCompositionSchema.parse({
            groups: formattedGroupsData,
        })

        const response = await apiWithAuth.patch<ApiResponse>(
            `/grouping/composition/${groupingId}`,
            data
        )

        revalidatePath(`/grouping/${groupingId}`)

        return {
            success: true,
            message: response.data.message,
        }
    } catch (e: any) {
        console.log(e)
        if (e instanceof ZodError) {
            return {
                success: false,
                message: getValidationErrorMessage(
                    convertZodErrorToValidationError(e)
                ),
            }
        }

        const validationErrors = e.response.data.error as
            | ValidationError[]
            | null

        return {
            success: false,
            message:
                validationErrors && validationErrors.length > 0
                    ? getValidationErrorMessage(validationErrors)
                    : e.response.data.message,
        }
    }
}
