import { getClassrooms } from '@/app/(with_navbar)/actions'
import { CLASSROOM_ROLE_TEACHER } from '@/types/classroom'
import { notFound } from 'next/navigation'

import { getActivity } from '../actions'
import EditActivityForm from './edit-activity-form'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const response = await getActivity(id)

    if (!response || response.classroom.role !== CLASSROOM_ROLE_TEACHER) {
        notFound()
    }

    const classrooms = await getClassrooms()
    const allClassrooms = [
        ...classrooms.judging_classrooms,
        ...classrooms.teaching_classrooms,
        ...classrooms.studying_classrooms,
    ].sort((a, b) => a.name.localeCompare(b.name))

    return (
        <EditActivityForm
            classroom={response.classroom}
            activity={response.activity}
            classrooms={allClassrooms}
        />
    )
}
