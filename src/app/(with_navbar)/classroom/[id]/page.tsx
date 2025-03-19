import { getClassroom } from './actions'

export default async function Page({
    params,
}: {
    params: {
        id: string
    }
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom) {
        // TODO classroom not found UI
        return 'Classroom Not Found'
    }

    return 'UI'
}
