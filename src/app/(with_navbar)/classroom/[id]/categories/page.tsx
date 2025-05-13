import { getClassroom } from '../actions'
import ClassroomHeader from '../classroom-header'
import ClassroomNotFound from '../classroom-not-found'
import CategoriesTab from './categories-tab'

export default async function Page({
    params,
}: {
    params: Promise<{
        id: string
    }>
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom) {
        return <ClassroomNotFound />
    }

    return (
        <div className="py-6">
            <div className="mb-4">
                <ClassroomHeader
                    classroom={classroom.classroom}
                    tab="categories"
                />
            </div>
            <section className="my-4">
                <CategoriesTab classroom={classroom} />
            </section>
        </div>
    )
}
