import { getRubricsInClassroom } from '@/app/(with_navbar)/classroom/[id]/activities/new/actions'
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

    const rubricsInClassroom = await getRubricsInClassroom(
        response.classroom.classroom.id
    )

    return (
        <EditActivityForm
            classroom={response.classroom}
            activity={response.activity}
            rubricsInClassroom={rubricsInClassroom}
        />
    )
}
