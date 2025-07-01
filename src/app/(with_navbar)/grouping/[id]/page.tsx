import NotFound from '@/app/[...notFound]/NotFound'

import { getgrouping } from './actions'
import Grouping from './grouping'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const groupingDetail = await getgrouping(id)

    // no need to check for classroom role, since our backend wont return anything if the user is not a teacher
    if (!groupingDetail) {
        return <NotFound />
    }

    return (
        <main className="pt-2 h-full">
            <Grouping groupingDetail={groupingDetail} />
        </main>
    )
}
