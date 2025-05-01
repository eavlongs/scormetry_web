import NotFound from '@/app/[...notFound]/NotFound'
import { getgrouping } from './actions'
import Grouping from './grouping'

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await params
    const groupingDetail = await getgrouping(id)

    if (!groupingDetail) {
        return <NotFound />
    }

    return (
        <main className="pt-2 h-full">
            <Grouping groupingDetail={groupingDetail} />
        </main>
    )
}
