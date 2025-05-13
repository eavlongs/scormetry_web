import { notFound } from 'next/navigation'
import { getClassroom } from '../../actions'
import CreateActivityForm from './create-activity-form'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom) {
        notFound()
    }

    return <CreateActivityForm classroom={classroom} />
}
