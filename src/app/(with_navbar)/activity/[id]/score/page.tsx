import { notFound } from 'next/navigation'
import { getActivity } from '../actions'
import ScoreActivity from './score-activity'

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
            <ScoreActivity activity={data.activity} />
        </main>
    )
}
