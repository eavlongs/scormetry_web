'use client'

import { Button } from '@/components/ui/button'
import useAppContext from '@/hooks/useAppContext'

export default function CreateClassroomButton() {
    const { setCreateClassroomDialog } = useAppContext()

    return (
        <Button onClick={() => setCreateClassroomDialog(true)}>
            Create Classroom
        </Button>
    )
}
