'use client'

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Grouping } from '@/types/classroom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../actions'
import { deleteGrouping } from './actions'

export function DeleteGroupingDialog({
    classroom,
    grouping,
    setGrouping,
}: {
    classroom: GetClassroomResponse
    grouping: Grouping | null
    setGrouping: React.Dispatch<React.SetStateAction<Grouping | null>>
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {
            setIsSubmitting(false)
        }
    }, [])

    async function handleSubmit() {
        if (!grouping) return

        setIsSubmitting(true)

        const response = await deleteGrouping(
            grouping.id,
            classroom.classroom.id
        )
        setIsSubmitting(false)

        if (response.success) {
            toast.success(response.message)
            setGrouping(null)
            return
        }

        toast.error(response.message)
        setGrouping(null)
    }

    return (
        <AlertDialog
            open={!!grouping}
            onOpenChange={(open) => !open && setGrouping(null)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Grouping</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the "{grouping?.name}"
                        grouping? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={() => setGrouping(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
