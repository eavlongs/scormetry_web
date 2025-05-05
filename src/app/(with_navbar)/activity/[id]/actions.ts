'use server'

import { apiWithAuth } from '@/lib/axios'
import { UserEssentialDetail } from '@/types/auth'
import { ActionResponse, ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'

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
