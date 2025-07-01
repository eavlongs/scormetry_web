import { CLASSROOM_ROLE_TEACHER } from '@/types/classroom'
import { notFound } from 'next/navigation'

import { getClassroom } from '../actions'
import ClassroomHeader from '../classroom-header'
import GroupingsTab from './groupings-tab'

export default async function Page({
    params,
}: {
    params: Promise<{
        id: string
    }>
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom || classroom.role !== CLASSROOM_ROLE_TEACHER) {
        return notFound()
    }

    return (
        <div className="pb-6 pt-4">
            <div className="mb-4">
                <ClassroomHeader
                    classroom={{
                        ...classroom.classroom,
                        role: classroom.role,
                    }}
                    tab="groupings"
                />
            </div>
            <section className="my-4">
                <GroupingsTab classroom={classroom} />
            </section>
        </div>
    )
}
