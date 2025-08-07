import { getClassrooms } from '@/app/(with_navbar)/actions'
import { CLASSROOM_ROLE_TEACHER, Classroom } from '@/types/classroom'
import { notFound } from 'next/navigation'

import { getClassroom } from '../../actions'
import CreateActivityForm from './create-activity-form'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom || classroom.role !== CLASSROOM_ROLE_TEACHER) {
        notFound()
    }

    const classrooms = await getClassrooms()
    const allClassrooms = [
        ...classrooms.judging_classrooms,
        ...classrooms.teaching_classrooms,
        ...classrooms.studying_classrooms,
    ].sort((a, b) => a.name.localeCompare(b.name))

    // thisClassroom should exist
    const thisClassroom = allClassrooms.find((c) => c.id === id) as Classroom

    const filteredClassrooms = allClassrooms.filter((c) => c.id !== id)

    const classroomsFinal = [thisClassroom, ...filteredClassrooms]

    return (
        <CreateActivityForm
            classroom={classroom}
            classrooms={classroomsFinal}
        />
    )
}
