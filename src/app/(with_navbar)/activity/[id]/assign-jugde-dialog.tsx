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
import { cn } from '@/lib/utils'
import { UserEssentialDetail } from '@/types/auth'
import { useState } from 'react'

import { SelectJudges } from './select-judges'

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
        <>
            <Dialog
                open={open}
                onOpenChange={(val) => {
                    if (!val) onClose()
                }}
                modal={false}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Judges</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-sm text-black">
                        {/* Please select the judges to be assigned to all group. Please
                    note that all the existing judge assignments will be
                    deleted. */}
                    </DialogDescription>
                    <LabelWrapper
                        label={{ text: 'Judges', field: 'judges' }}
                        options={{ required: false }}
                    >
                        <SelectJudges
                            judges={judges}
                            selectedJudges={selectedJudges}
                            onSelectedJudgeValueChange={
                                setCurrentlySelectedJudges
                            }
                        />
                    </LabelWrapper>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                onAssignJudges(
                                    currentlySelectedJudges.map(
                                        (judge) => judge.id
                                    )
                                )
                            }}
                        >
                            Assign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div
                data-state={open ? 'open' : 'closed'}
                className={cn(
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 bg-black/50',
                    open ? 'z-50' : 'z-[-1]'
                )}
            ></div>
        </>
    )
}
