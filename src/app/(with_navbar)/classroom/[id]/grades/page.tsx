import { getActivities } from '../actions'
import ClassroomHeader from '../classroom-header'
import ClassroomNotFound from '../classroom-not-found'
import { getClassroomGrades } from './actions'
import GradesTab from './grades-tab'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const activities = await getActivities(id)

    if (!activities) {
        return <ClassroomNotFound />
    }

    activities.activities.reverse()
    activities.activities = activities.activities.filter(
        (a) => a.scoring_type !== null
    )

    const grades = await getClassroomGrades(id)

    // return <GradesTab activities={activities} grades={grades} />
    return (
        <div className="py-6">
            <div className="mb-4 w-full">
                <ClassroomHeader
                    classroom={activities.classroom}
                    tab="grades"
                />
            </div>
            <section className="my-4">
                <GradesTab activities={activities} grades={grades} />
            </section>
        </div>
    )
}
