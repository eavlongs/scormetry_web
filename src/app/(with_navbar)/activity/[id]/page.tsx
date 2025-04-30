import { notFound } from 'next/navigation'
import { getActivity } from './edit/actions'
import ViewActivity from './view-activity'

export default async function ActivityPage({
    params,
}: {
    params: { id: string }
}) {
    const { id } = await params
    const data = await getActivity(id)

    if (!data) {
        notFound()
    }

    return (
        <main className="pt-2">
            <ViewActivity activity={data.activity} classroom={data.classroom} />
        </main>
    )
}
