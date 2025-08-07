import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import React from 'react'

import { GetGroupingDetailResponse } from './actions'

export function DeleteGroupDialog({
    group,
    setGroup,
    onDelete,
}: {
    group: GetGroupingDetailResponse['groups'][number] | null
    setGroup: React.Dispatch<React.SetStateAction<typeof group>>
    onDelete(group: string): void
}) {
    return (
        <AlertDialog
            open={!!group}
            onOpenChange={(val) => {
                if (!val) {
                    setGroup(null)
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Group</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete the group &quot;{group?.name}&quot; and
                        move all its members to the ungrouped students list.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (group) onDelete(group.id)
                        }}
                    >
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
