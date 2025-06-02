import { notFound } from 'next/navigation'
import { getClassroom } from '../actions'
import ClassroomHeader from '../classroom-header'
import PeopleTab from './people-tab'

export default async function Page({
    params,
}: {
    params: Promise<{
        id: string
    }>
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom) {
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
                    tab="people"
                />
            </div>
            <section className="my-4">
                <PeopleTab classroom={classroom} />
            </section>
        </div>
    )
}
