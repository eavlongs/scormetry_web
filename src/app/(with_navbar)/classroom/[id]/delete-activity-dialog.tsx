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
import { Activity } from '@/types/classroom'

export default function DeleteActivityDialog({
    activity,
    onDelete,
    onClose,
}: {
    activity: Activity | null
    onDelete: (id: string) => void
    onClose: () => void
}) {
    return (
        <AlertDialog
            open={!!activity}
            onOpenChange={(val) => !val && onClose()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Class</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the activity "
                        {activity?.title}"?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        onClick={() => activity && onDelete(activity.id)}
                        variant="destructive"
                    >
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
