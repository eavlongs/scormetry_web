'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { Button } from '@/components/ui/button'
import { UserEssentialDetail } from '@/types/auth'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AssignJudgeDialog } from './assign-jugde-dialog'
import { assignJudgesToAllGroups } from './actions'
import { toast } from 'sonner'

export default function AssignJudgeAll({
    activityID,
    judges,
}: {
    activityID: string
    judges: UserEssentialDetail[]
}) {
    const [open, setOpen] = useState(false)

    async function handleAssignJudges(judgesId: string[]) {
        const response = await assignJudgesToAllGroups(activityID, judgesId)

        if (response.success) {
            toast.success(response.message)
            setOpen(false)
        } else {
            toast.error(response.message)
        }
    }

    return (
        <>
            <SimpleToolTip text="Assign judge to all groups">
                <Button variant="outline" onClick={() => setOpen(true)}>
                    <Plus className="h-5 w-5" />
                    Assign
                </Button>
            </SimpleToolTip>
            <AssignJudgeDialog
                open={open}
                onClose={() => setOpen(false)}
                judges={judges}
                selectedJudges={[]}
                onAssignJudges={handleAssignJudges}
            />
        </>
    )
}
