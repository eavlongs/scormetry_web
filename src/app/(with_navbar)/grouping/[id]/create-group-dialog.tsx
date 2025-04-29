import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { GroupNameSchema } from '@/schema'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ZodError } from 'zod'
import { GetGroupingDetailResponse } from './actions'

export function CreateGroupDialog({
    grouping_id,
    isOpen,
    setOpen,
    onCreateGroup,
}: {
    grouping_id: string
    isOpen: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    onCreateGroup(group: GetGroupingDetailResponse['groups'][number]): void
}) {
    const [newGroupName, setNewGroupName] = useState('')
    const [createGroupErrorMessage, setCreateGroupErrorMessage] = useState('')

    useEffect(() => {
        if (isOpen) {
            setNewGroupName('')
        }
    }, [isOpen])

    function handleCreateGroup() {
        setCreateGroupErrorMessage('')
        try {
            const groupName = GroupNameSchema.parse(newGroupName)

            const newGroup: GetGroupingDetailResponse['groups'][number] = {
                id: `group-${new Date().getTime()}`,
                name: groupName.trim(),
                grouping_id: grouping_id,
                users: [],
            }
            onCreateGroup(newGroup)
            setNewGroupName('')
            setOpen(false)
        } catch (e) {
            if (e instanceof ZodError) {
                setCreateGroupErrorMessage(e.issues[0].message)
                return
            }
            toast.error('Something went wrong. Please try again.')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <LabelWrapper
                        label={{
                            text: 'Group Name',
                            field: 'name',
                        }}
                        error={createGroupErrorMessage}
                    >
                        <Input
                            placeholder="Enter group name"
                            id="name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                    </LabelWrapper>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateGroup}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
