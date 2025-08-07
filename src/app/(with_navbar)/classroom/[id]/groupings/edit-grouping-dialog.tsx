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
import { Grouping } from '@/types/classroom'
import { VALIDATION_ERROR_MESSAGE, ValidationError } from '@/types/response'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { GetClassroomResponse } from '../actions'
import { updateGrouping } from './actions'

interface EditGroupingDialogProps {
    grouping: Grouping | null
    setGrouping: React.Dispatch<React.SetStateAction<Grouping | null>>
    classroom: GetClassroomResponse
}

export function EditGroupingDialog({
    grouping,
    setGrouping,
    classroom,
}: EditGroupingDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
        []
    )
    const nameRef = useRef<HTMLInputElement>(null)
    const descriptionRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (!grouping) {
            setValidationErrors([])
            setIsSubmitting(false)
        }
    }, [grouping])

    async function handleSubmit() {
        if (!grouping) return

        setIsSubmitting(true)
        setValidationErrors([])
        const name = nameRef.current?.value
        const description = descriptionRef.current?.value

        const response = await updateGrouping(
            grouping.id,
            name ?? '',
            description ?? '',
            classroom.classroom.id
        )

        setIsSubmitting(false)

        if (response.success) {
            toast.success(response.message)
            setGrouping(null)
            return
        }

        if (response.message === VALIDATION_ERROR_MESSAGE && response.error) {
            setValidationErrors(response.error)
            return
        }
        toast.error(response.message)
    }

    return (
        <AlertDialog
            open={!!grouping}
            onOpenChange={(open) => !open && setGrouping(null)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Grouping</AlertDialogTitle>
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
                                    defaultValue={grouping?.name}
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
                                    defaultValue={grouping?.description}
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
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
