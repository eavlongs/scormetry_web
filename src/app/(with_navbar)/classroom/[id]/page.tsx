import { getClassroom } from './actions'
import ActivitiesTab from './activities-tab'
import ClassroomHeader from './classroom-header'
import ClassroomNotFound from './classroom-not-found'

export default async function Page({
    params,
    searchParams,
}: {
    params: {
        id: string
    }
    searchParams: {
        success_message: string
        error_message: string
    }
}) {
    const { success_message, error_message } = await searchParams
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom) {
        return <ClassroomNotFound />
    }

    return (
        <div className="py-6">
            <div className="mb-4">
                <ClassroomHeader classroom={classroom} tab="activities" />
            </div>
            <section className="my-4">
                <ActivitiesTab
                    classroom={classroom}
                    successMessage={success_message}
                    errorMessage={error_message}
                />
            </section>
        </div>
    )
}
