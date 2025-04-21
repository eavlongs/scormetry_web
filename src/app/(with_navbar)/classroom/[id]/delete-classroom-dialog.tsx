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
import { Classroom } from '@/types/classroom'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner'
import { deleteClassroom } from './actions'

export default function DeleteClassroomDialog({
    classroom,
    open,
    setOpen,
}: {
    classroom: Classroom
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}) {
    const router = useRouter()

    async function handleSubmit() {
        const response = await deleteClassroom(classroom.id)

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
                        Are you sure you want to delete the "{classroom.name}"
                        classroom?
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
