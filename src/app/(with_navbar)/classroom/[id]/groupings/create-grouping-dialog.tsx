'use client'

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Textarea } from '@/components/ui/textarea'
import { getErrorMessageFromValidationError } from '@/lib/utils'
import { VALIDATION_ERROR_MESSAGE, ValidationError } from '@/types/response'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../actions'
import { createGrouping } from './actions'

interface CreateGroupingDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    classroom: GetClassroomResponse
}

export function CreateGroupingDialog({
    open,
    setOpen,
    classroom,
}: CreateGroupingDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
        []
    )
    const nameRef = useRef<HTMLInputElement>(null)
    const descriptionRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (!open) {
            setValidationErrors([])
            setIsSubmitting(false)
        }
    }, [open])

    async function handleSubmit() {
        setIsSubmitting(true)
        setValidationErrors([])
        const name = nameRef.current?.value
        const description = descriptionRef.current?.value

        const response = await createGrouping(
            classroom.classroom.id,
            name ?? '',
            description ?? ''
        )

        setIsSubmitting(false)

        if (response.success) {
            toast.success(response.message)
            setOpen(false)
            return
        }

        if (response.message === VALIDATION_ERROR_MESSAGE && response.error) {
            setValidationErrors(response.error)
            return
        }
        toast.error(response.message)
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create New Grouping</AlertDialogTitle>
                </AlertDialogHeader>
                <form>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <LabelWrapper
                                label={{
                                    text: 'Name',
                                    field: 'name',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'name'
                                )}
                            >
                                <Input
                                    id="name"
                                    placeholder="Grouping name"
                                    ref={nameRef}
                                />
                            </LabelWrapper>
                        </div>
                        <div className="grid gap-2">
                            <LabelWrapper
                                label={{
                                    text: 'Description',
                                    field: 'description',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'description'
                                )}
                                options={{
                                    required: false,
                                }}
                            >
                                <Textarea
                                    id="description"
                                    placeholder="Description"
                                    ref={descriptionRef}
                                />
                            </LabelWrapper>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
