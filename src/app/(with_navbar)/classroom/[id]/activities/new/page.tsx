import { notFound } from 'next/navigation'
import { getClassroom } from '../../actions'
import CreateActivityForm from './create-activity-form'
import { getRubricsInClassroom } from './actions'
import { CLASSROOM_ROLE_TEACHER } from '@/types/classroom'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom || classroom.role !== CLASSROOM_ROLE_TEACHER) {
        notFound()
    }

    const rubricsInClassroom = await getRubricsInClassroom(id)

    return (
        <CreateActivityForm
            classroom={classroom}
            rubricsInClassroom={rubricsInClassroom}
        />
    )
}
