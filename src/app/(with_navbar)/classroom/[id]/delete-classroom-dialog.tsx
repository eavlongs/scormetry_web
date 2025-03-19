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
import { Dispatch, SetStateAction } from 'react'
import { deleteClassroom, GetClassroomResponse } from './actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteClassroomDialog({
    classroom,
    open,
    setOpen,
}: {
    classroom: GetClassroomResponse
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}) {
    const router = useRouter()

    async function handleSubmit() {
        const response = await deleteClassroom(classroom.classroom.id)

        if (response.success) {
            toast.success(response.message)
            router.replace('/')
            return
        }

        toast.error(response.message)
        setOpen(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Class</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the "
                        {classroom.classroom.name}" classroom?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleSubmit} variant="destructive">
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
