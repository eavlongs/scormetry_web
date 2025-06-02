import { notFound } from 'next/navigation'
import { getActivities } from './actions'
import ActivitiesTab from './activities-tab'
import ClassroomHeader from './classroom-header'

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        success_message: string
        error_message: string
    }>
}) {
    const { success_message, error_message } = await searchParams
    const { id } = await params
    const response = await getActivities(id)

    if (!response || !response.classroom) {
        return notFound()
    }

    return (
        <div className="pb-6 pt-4">
            <div className="mb-4">
                <ClassroomHeader
                    classroom={response.classroom}
                    tab="activities"
                />
            </div>
            <section className="my-4">
                <ActivitiesTab
                    classroom={response.classroom}
                    activities={response.activities}
                    successMessage={success_message}
                    errorMessage={error_message}
                />
            </section>
        </div>
    )
}
