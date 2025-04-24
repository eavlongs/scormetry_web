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
import { Category } from '@/types/classroom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../actions'
import { deleteCategory } from './actions'

export function DeleteCategoryDialog({
    classroom,
    category,
    setCategory,
}: {
    classroom: GetClassroomResponse
    category: Category | null
    setCategory: React.Dispatch<React.SetStateAction<Category | null>>
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {
            setIsSubmitting(false)
        }
    }, [])

    async function handleSubmit() {
        if (!category) return

        setIsSubmitting(true)

        const response = await deleteCategory(
            category.id,
            classroom.classroom.id
        )
        setIsSubmitting(false)

        if (response.success) {
            toast.success(response.message)
            setCategory(null)
            return
        }

        toast.error(response.message)
        setCategory(null)
    }

    return (
        <AlertDialog
            open={!!category}
            onOpenChange={(open) => !open && setCategory(null)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the category &quot;
                        {category?.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={() => setCategory(null)}>
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
