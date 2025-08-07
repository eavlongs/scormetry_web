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
import { updateCategory } from './actions'

export function EditCategoryDialog({
    classroom,
    category,
    setCategory,
}: {
    classroom: GetClassroomResponse
    category: Category | null
    setCategory: React.Dispatch<React.SetStateAction<Category | null>>
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
        []
    )
    const nameRef = useRef<HTMLInputElement>(null)
    const scorePercentageRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        return () => {
            setValidationErrors([])
            setIsSubmitting(false)
        }
    }, [])

    async function handleSubmit() {
        if (!category) return

        setIsSubmitting(true)
        setValidationErrors([])
        const name = nameRef.current?.value
        const scorePercentage = scorePercentageRef.current?.value

        const response = await updateCategory(
            category.id,
            name ?? '',
            parseFloat(
                scorePercentage &&
                    typeof scorePercentage === 'string' &&
                    scorePercentage !== ''
                    ? scorePercentage
                    : '0'
            ),
            classroom.classroom.id
        )
        setIsSubmitting(false)

        if (response.success) {
            setCategory(null)
            toast.success(response.message)
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
            open={!!category}
            onOpenChange={(open) => !open && setCategory(null)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Category</AlertDialogTitle>
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
                                    defaultValue={category?.name}
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
                                    defaultValue={category?.score_percentage}
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
