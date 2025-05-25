import { notFound } from 'next/navigation'
import { getActivity } from '../actions'
import EditActivityForm from './edit-activity-form'
import { getRubricsInClassroom } from '@/app/(with_navbar)/classroom/[id]/activities/new/actions'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const response = await getActivity(id)

    if (!response) {
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
