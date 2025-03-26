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
        <div className="container py-6 space-y-6">
            <ClassroomHeader classroom={classroom} tab="activities" />
            <ActivitiesTab
                classroom={classroom}
                successMessage={success_message}
                errorMessage={error_message}
            />
        </div>
    )
}
