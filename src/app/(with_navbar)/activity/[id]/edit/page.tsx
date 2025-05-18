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

    if (!response) {
        notFound()
    }

    return (
        <EditActivityForm
            classroom={response.classroom}
            activity={response.activity}
        />
    )
}
