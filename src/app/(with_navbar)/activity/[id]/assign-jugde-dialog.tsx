'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { UserEssentialDetail } from '@/types/auth'
import React, { useState } from 'react'
import { SelectJudges } from './select-judges'
import useSession from '@/hooks/useSession'

export function AssignJudgeDialog({
    open,
    onClose,
    judges,
    selectedJudges,
    onAssignJudges,
}: {
    open: boolean
    onClose: () => void
    judges: UserEssentialDetail[]
    selectedJudges: UserEssentialDetail[]
    onAssignJudges: (judgesId: string[]) => void
}) {
    const [currentlySelectedJudges, setCurrentlySelectedJudges] =
        useState<UserEssentialDetail[]>(selectedJudges)

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (!val) onClose()
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Judges</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-sm text-black">
                    Please select the judges to be assigned to all group. Please
                    note that all the existing judge assignments will be
                    deleted.
                </DialogDescription>
                <LabelWrapper
                    label={{ text: 'Judges', field: 'judges' }}
                    options={{ required: false }}
                >
                    <SelectJudges
                        judges={judges}
                        selectedJudges={selectedJudges}
                        onSelectedJudgeValueChange={setCurrentlySelectedJudges}
                    />
                </LabelWrapper>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onAssignJudges(
                                currentlySelectedJudges.map((judge) => judge.id)
                            )
                        }}
                    >
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
