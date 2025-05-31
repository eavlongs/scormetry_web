import { notFound } from 'next/navigation'
import { getActivity } from '../actions'
import ScoreActivity from './score-activity'
import { CLASSROOM_ROLE_JUDGE, CLASSROOM_ROLE_TEACHER } from '@/types/classroom'

export default async function ActivityPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const data = await getActivity(id)

    if (
        !data ||
        (data.classroom.role !== CLASSROOM_ROLE_TEACHER &&
            data.classroom.role !== CLASSROOM_ROLE_JUDGE)
    ) {
        notFound()
    }

    return (
        <main className="pt-2">
            <ScoreActivity activity={data.activity} />
        </main>
    )
}
