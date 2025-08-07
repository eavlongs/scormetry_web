import { Classroom } from '@/types/classroom'

import { getClassrooms } from '../(with_navbar)/actions'
import ClientTest from './client-test'

export default async function Page() {
    const classrooms = await getClassrooms()
    const allClassrooms = [
        ...classrooms.judging_classrooms,
        ...classrooms.teaching_classrooms,
        ...classrooms.studying_classrooms,
    ].sort((a, b) => a.name.localeCompare(b.name))

    return <ClientTest classrooms={allClassrooms} />
}
