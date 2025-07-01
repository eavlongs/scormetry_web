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
import {
    getErrorMessageFromValidationError,
    limitFloatInputDecimalPlaces,
    preventNonNumericInput,
} from '@/lib/utils'
import { Category } from '@/types/classroom'
import { VALIDATION_ERROR_MESSAGE, ValidationError } from '@/types/response'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { GetClassroomResponse } from '../actions'
import { createCategory } from './actions'

interface CreateCategoryDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    classroom: GetClassroomResponse
    onCreate?: (category: Category) => void
}

export function CreateCategoryDialog({
    open,
    setOpen,
    classroom,
    onCreate,
}: CreateCategoryDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
        []
    )
    const nameRef = useRef<HTMLInputElement>(null)
    const scorePercentageRef = useRef<HTMLInputElement>(null)

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
        const scorePercentage = scorePercentageRef.current?.value

        const response = await createCategory(
            classroom.classroom.id,
            name ?? '',
            parseFloat(
                scorePercentage &&
                    typeof scorePercentage === 'string' &&
                    scorePercentage !== ''
                    ? scorePercentage
                    : '0'
            )
        )
        setIsSubmitting(false)

        if (response.success) {
            toast.success(response.message)
            setOpen(false)
            if (onCreate && response.data) onCreate(response.data.category)
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
                    <AlertDialogTitle>Create New Category</AlertDialogTitle>
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
                                    placeholder="Category name"
                                    ref={nameRef}
                                />
                            </LabelWrapper>
                        </div>
                        <div className="grid gap-2">
                            <LabelWrapper
                                label={{
                                    text: 'Score Percentage',
                                    field: 'score_percentage',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'score_percentage'
                                )}
                            >
                                <Input
                                    id="score_percentage"
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    onKeyDown={(e) => {
                                        preventNonNumericInput(e)

                                        if (e.key === 'Enter') {
                                            handleSubmit()
                                        }

                                        limitFloatInputDecimalPlaces(
                                            e,
                                            scorePercentageRef,
                                            2
                                        )
                                    }}
                                    ref={scorePercentageRef}
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
