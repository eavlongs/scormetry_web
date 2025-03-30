import { revalidateData } from '@/app/(with_navbar)/actions'
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
import { ClassroomUserDetail } from '@/types/auth'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../actions'
import { deleteClassroomUser } from './actions'

export default function DeleteClassroomUserDialog({
    classroom,
    user,
    setUser,
}: {
    classroom: GetClassroomResponse
    user: ClassroomUserDetail | null
    setUser: React.Dispatch<React.SetStateAction<ClassroomUserDetail | null>>
}) {
    const [isInvited, setIsInvited] = useState(false)

    useEffect(() => {
        setIsInvited(!user?.first_name)
    }, [user])

    async function handleDelete() {
        if (!user) return

        const response = await deleteClassroomUser(user.id)

        if (!response.success) {
            toast.error(response.message)
            setUser(null)
            return
        }

        await revalidateData(`/classroom/${classroom.classroom.id}/people`)
        toast.success(response.message)
        setUser(null)
    }

    return (
        user && (
            <AlertDialog
                open={!!user}
                onOpenChange={(open) => !open && setUser(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove {isInvited ? 'invitation' : 'user'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove{' '}
                            {isInvited ? 'the invitation for' : ''}{' '}
                            <span className="font-bold">
                                {user.first_name
                                    ? user.first_name + ' ' + user.last_name
                                    : user.email}
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            Remove
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    )
}
