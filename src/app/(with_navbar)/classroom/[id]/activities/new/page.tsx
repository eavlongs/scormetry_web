import { redirect, RedirectType } from 'next/navigation'
import { getClassroom } from '../../actions'
import CreateActivityForm from './create-activity-form'
import { redirectToNotFoundPageWithRedirectUrl } from '@/lib/utils'

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom) {
        return redirectToNotFoundPageWithRedirectUrl(
            `/classroom/${id}/activities/new`
        )
    }
    return <CreateActivityForm classroom={classroom} />
}
