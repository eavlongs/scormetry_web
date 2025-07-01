'use server'

import { apiWithAuth } from '@/lib/axios'
import { UserEssentialDetail } from '@/types/auth'
import { GetActivity } from '@/types/classroom'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'

import { GetClassroomResponse } from '../../classroom/[id]/actions'
import { ScoreData } from './score/score-activity'

export async function getActivity(activityId: string) {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                activity: GetActivity
                classroom: GetClassroomResponse
            }>
        >(`/activity/${activityId}`)

        return {
            ...response.data.data!,
        }
    } catch (e: any) {
        return null
    }
}

export async function assignJudgesToGroup(
    activityId: string,
    groupId: string,
    judgesId: string[]
): Promise<
    ActionResponse<{
        judges: UserEssentialDetail[]
    }>
> {
    try {
        const response = await apiWithAuth.post<
            ApiResponse<{
                judges: UserEssentialDetail[]
            }>
        >(`/activity/${activityId}/assign-judge/group`, {
            group_id: groupId,
            judges_id: judgesId,
        })

        revalidatePath('/activity/' + activityId)
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        return {
            success: false,
            message:
                e.response.data.message || 'Failed to assign judges to group',
        }
    }
}

export async function assignJudgesToStudent(
    activityId: string,
    studentId: string,
    judgesId: string[]
): Promise<
    ActionResponse<{
        judges: UserEssentialDetail[]
    }>
> {
    try {
        const response = await apiWithAuth.post<
            ApiResponse<{
                judges: UserEssentialDetail[]
            }>
        >(`/activity/${activityId}/assign-judge/student`, {
            student_id: studentId,
            judges_id: judgesId,
        })

        revalidatePath('/activity/' + activityId)
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        return {
            success: false,
            message:
                e.response.data.message || 'Failed to assign judges to group',
        }
    }
}

export async function assignJudgesToEveryone(
    activityId: string,
    judgesId: string[]
): Promise<
    ActionResponse<{
        judges: UserEssentialDetail[]
    }>
> {
    try {
        const response = await apiWithAuth.post<
            ApiResponse<{
                judges: UserEssentialDetail[]
            }>
        >(`/activity/${activityId}/assign-judge/all`, {
            judges_id: judgesId,
        })

        revalidatePath('/activity/' + activityId)
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        }
    } catch (e: any) {
        return {
            success: false,
            message:
                e.response.data.message || 'Failed to assign judges to group',
        }
    }
}

export async function getRubricScoreDetail(
    activitiyAssignmentId: string
): Promise<
    ActionResponse<
        {
            judge: UserEssentialDetail
            comment: string
            data: ScoreData['rubric_score']
        }[]
    >
> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                data: {
                    judge: UserEssentialDetail
                    comment: string
                    data: ScoreData['rubric_score']
                }[]
            }>
        >(`/activity_assignment/${activitiyAssignmentId}/score/rubric/all`)

        return {
            success: true,
            message: response.data.message,
            data: response.data.data!.data,
        }
    } catch (e: any) {
        console.log(e)
        return {
            success: false,
            message:
                e.response?.data?.message ||
                'Failed to get rubric score detail',
            data: [],
        }
    }
}

export async function getRangeScoreDetail(
    activitiyAssignmentId: string
): Promise<
    ActionResponse<
        {
            judge: UserEssentialDetail
            comment: string
            data: ScoreData['range_based_scores']
        }[]
    >
> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                data: {
                    judge: UserEssentialDetail
                    comment: string
                    data: ScoreData['range_based_scores']
                }[]
            }>
        >(`/activity_assignment/${activitiyAssignmentId}/score/range/all`)

        return {
            success: true,
            message: response.data.message,
            data: response.data.data!.data,
        }
    } catch (e: any) {
        console.log(e)
        return {
            success: false,
            message:
                e.response?.data?.message || 'Failed to get range score detail',
            data: [],
        }
    }
}

export type GetRangeScoreFromAJudge = {
    judge: UserEssentialDetail
    score: number
}

export type GetRubricScoreFromJudge = {
    judge: UserEssentialDetail
    scores: {
        rubric_criteria_id: string
        score: number
    }[]
}

export async function getScoresOfActivity(
    activityId: string,
    scoringType: 'range' | 'rubric'
): Promise<
    ActionResponse<
        {
            student: UserEssentialDetail
            score_data: GetRubricScoreFromJudge[] | GetRangeScoreFromAJudge[]
        }[]
    >
> {
    try {
        const response = await apiWithAuth.get<
            ApiResponse<{
                scores: {
                    student: UserEssentialDetail
                    score_data:
                        | GetRubricScoreFromJudge[]
                        | GetRangeScoreFromAJudge[]
                }[]
            }>
        >(`activity/${activityId}/score/${scoringType}`)
        return {
            success: true,
            message: response.data.message,
            data: response.data.data!.scores,
        }
    } catch (e: any) {
        console.log(e)
        return {
            success: false,
            message: e.response?.data?.message || 'Failed to get score detail',
            data: [],
        }
    }
}
