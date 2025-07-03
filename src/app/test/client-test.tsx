'use client'

import { SelectActivityInClassroomDialog } from '@/components/select-activity-in-classroom-dialog'
import { Classroom } from '@/types/classroom'

export default function ClientTest({
    classrooms,
}: {
    classrooms: Classroom[]
}) {
    return (
        <SelectActivityInClassroomDialog
            classrooms={classrooms}
            open={true}
            onOpenChange={() => {}}
            onSelect={() => {}}
        />
    )
}
