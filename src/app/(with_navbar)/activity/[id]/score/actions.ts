'use server'

import { apiWithAuth } from '@/lib/axios'
import { getValidationErrorWithNestedPathActionResponse } from '@/lib/utils'
import { ActivityScoreBaseSchema, CreateActivityScoreSchema } from '@/schema'
import { ScoringEntity } from '@/types/classroom'
import { PATH_FOR_ERROR_TO_TOAST } from '@/types/general'
import {
    ActionResponse,
    ApiResponse,
    NestedPathValidationError,
} from '@/types/response'
import { z, ZodError } from 'zod'

export async function saveScoringData(
    activity_assignment_id: string,
    paramsForValidationSchema: Parameters<typeof CreateActivityScoreSchema>[0],
    data: z.infer<ReturnType<typeof CreateActivityScoreSchema>>
): Promise<ActionResponse<any, NestedPathValidationError[]>> {
    if (
        paramsForValidationSchema.type != 'rubric' &&
        paramsForValidationSchema.type != 'range'
    ) {
        throw new Error("only support 'rubric' and 'range' type")
    }
    try {
        const parsedData = CreateActivityScoreSchema(
            paramsForValidationSchema
        ).parse(data)

        console.log(data)

        const route =
            paramsForValidationSchema.type == 'rubric'
                ? `/activity_assignment/${activity_assignment_id}/score/rubric`
                : `/activity_assignment/${activity_assignment_id}/score/range`

        const response = await apiWithAuth.post<ApiResponse>(route, parsedData)

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        if (e instanceof ZodError) {
            return getValidationErrorWithNestedPathActionResponse(e, {
                [['scores', PATH_FOR_ERROR_TO_TOAST].join(',')]: [
                    PATH_FOR_ERROR_TO_TOAST,
                ],
            })
        }

        return {
            success: false,
            message: e.response.data.message,
            error: e.response?.data?.error,
        }
    }
}

export async function getActivityAssignmentScoreForStudent(
    entity: ScoringEntity,
    scoringType: 'rubric' | 'range'
): Promise<
    ActionResponse<{
        comment: z.infer<typeof ActivityScoreBaseSchema>['comment']
        data: z.infer<ReturnType<typeof CreateActivityScoreSchema>>
    }>
> {
    const route =
        scoringType == 'rubric'
            ? `/activity_assignment/${entity.activity_assignment_id}/score/rubric`
            : `/activity_assignment/${entity.activity_assignment_id}/score/range`
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                comment: z.infer<typeof ActivityScoreBaseSchema>['comment']
                data: z.infer<ReturnType<typeof CreateActivityScoreSchema>>
            }>
        >(route)

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        console.error(e)
        return {
            success: false,
            message: e.response.data.message,
            error: e.response?.data?.error,
        }
    }
}
