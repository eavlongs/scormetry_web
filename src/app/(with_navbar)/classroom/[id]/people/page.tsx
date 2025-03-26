import { getClassroom } from '../actions'
import ClassroomHeader from '../classroom-header'
import ClassroomNotFound from '../classroom-not-found'
import PeopleTab from '../people-tab'

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
        <div className="container py-6 space-y-6">
            <ClassroomHeader classroom={classroom} tab="people" />
            <PeopleTab classroom={classroom} />
        </div>
    )
}
