import { getClassroom } from '../actions'
import ClassroomHeader from '../classroom-header'
import ClassroomNotFound from '../classroom-not-found'
import PeopleTab from './people-tab'

export default async function Page({
    params,
}: {
    params: {
        id: string
    }
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom) {
        return <ClassroomNotFound />
    }

    return (
        <div className="py-6">
            <div className="mb-4">
                <ClassroomHeader classroom={classroom.classroom} tab="people" />
            </div>
            <section className="my-4">
                <PeopleTab classroom={classroom} />
            </section>
        </div>
    )
}
