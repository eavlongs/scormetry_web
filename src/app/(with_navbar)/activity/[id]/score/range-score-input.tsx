'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { getErrorMessageFromValidationError } from '@/lib/utils'
import { ScoringEntity } from '@/types/classroom'
import { ValidationError } from '@/types/response'
import { Copy } from 'lucide-react'
import Image from 'next/image'
import { ComponentProps, FocusEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export type RangeScore = {
    student_id: string
    score: number
}

export default function RangeScoreInput({
    entity,
    initialScores,
    onScoreUpdate,
    maxScore,
}: {
    initialScores: RangeScore[] | undefined
    entity: ScoringEntity
    onScoreUpdate: (scores: RangeScore[]) => void
    maxScore: number
}) {
    const [scores, setScores] = useState<RangeScore[]>(initialScores ?? [])
    const [errors, setErrors] = useState<ValidationError[]>([])

    useEffect(() => {
        setScores(initialScores ?? [])
    }, [initialScores])

    useEffect(() => {
        onScoreUpdate(scores)
    }, [scores])

    function addOrReplaceScore(student_id: string, score: number) {
        const newScores = [...scores]
        const index = newScores.findIndex((s) => s.student_id === student_id)

        if (index !== -1) {
            newScores[index].score = score
        } else {
            newScores.push({
                student_id: student_id,
                score: score,
            })
        }

        setScores(newScores)
    }

    function removeScore(student_id: string) {
        const newScores = [...scores]
        const index = newScores.findIndex((s) => s.student_id === student_id)

        if (index !== -1) {
            newScores.splice(index, 1)
        }

        setScores(newScores)
    }

    function addOrReplaceError(error: ValidationError) {
        const newErrors = [...errors]
        const index = newErrors.findIndex((e) => e.field === error.field)

        if (index !== -1) {
            newErrors[index] = error
        } else {
            newErrors.push(error)
        }

        setErrors(newErrors)
    }

    function removeError(path: string) {
        const newErrors = [...errors]
        const filtered = newErrors.filter((e) => e.field !== path)

        setErrors(filtered)
    }

    function handleOnBlur(student_id: string, e: FocusEvent<HTMLInputElement>) {
        if (e.target.value == '') {
            removeScore(student_id)
            return
        }
        const scoreNum = parseFloat(e.target.value)
        if (isNaN(scoreNum)) {
            addOrReplaceError({
                field: student_id,
                message: 'Score must be a number',
            })
            return
        }

        if (scoreNum >= 0 && scoreNum <= maxScore) {
            addOrReplaceScore(student_id, scoreNum)
            removeError(student_id)
        } else {
            addOrReplaceScore(student_id, scoreNum)
            setTimeout(() => {
                addOrReplaceError({
                    field: student_id,
                    message: 'Score should be between 0 and ' + maxScore,
                })
            }, 0)
        }
    }

    function handleApplyAll(studentId: string) {
        if (entity.type !== 'group') return
        const score = scores.find((s) => s.student_id === studentId)?.score

        if (score === undefined) {
            toast.error('Cannot apply empty score')
            return
        }

        if (score >= 0 && score <= maxScore) {
            for (const student of entity.entity.users) {
                addOrReplaceScore(student.id, score)
                removeError(student.id)
            }
        } else {
            toast.error(
                'Please make sure that the score is within a valid range.'
            )
        }
    }
    return (
        <>
            {entity.type == 'individual' && (
                <ScoreInput
                    maxScore={maxScore}
                    onBlur={(e) => handleOnBlur(entity.entity.id, e)}
                    error={getErrorMessageFromValidationError(
                        errors,
                        entity.entity.id
                    )}
                    defaultValue={
                        scores.find((s) => s.student_id === entity.entity.id)
                            ?.score
                    }
                />
            )}
            {entity.type == 'group' && (
                <div className="flex flex-col gap-y-4">
                    {entity.entity.users.map((student) => {
                        return (
                            <div
                                key={student.id}
                                className="flex flex-col gap-y-2"
                            >
                                <div className="flex items-center gap-x-2">
                                    <div className="relative h-8 w-8 cursor-pointer">
                                        <Image
                                            src={student.profile_picture}
                                            alt={
                                                student.first_name +
                                                ' ' +
                                                student.last_name
                                            }
                                            fill
                                            className="rounded-full"
                                        />
                                    </div>
                                    <span>
                                        {student.first_name +
                                            ' ' +
                                            student.last_name}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <ScoreInput
                                        maxScore={maxScore}
                                        onBlur={(e) =>
                                            handleOnBlur(student.id, e)
                                        }
                                        error={getErrorMessageFromValidationError(
                                            errors,
                                            student.id
                                        )}
                                        defaultValue={
                                            scores.find(
                                                (s) =>
                                                    s.student_id === student.id
                                            )?.score
                                        }
                                    />
                                    {scores.find(
                                        (s) => s.student_id === student.id
                                    )?.score !== undefined && (
                                        <SimpleToolTip text="Apply to all students in group">
                                            <Button
                                                variant="ghost"
                                                onClick={() =>
                                                    handleApplyAll(student.id)
                                                }
                                            >
                                                <Copy />
                                            </Button>
                                        </SimpleToolTip>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}

function ScoreInput({
    maxScore,
    onBlur,
    error,
    defaultValue,
}: {
    maxScore: number
    onBlur: ComponentProps<'input'>['onBlur']
    error: string
    defaultValue?: number | string
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        console.log('defaultValue', defaultValue)
        if (inputRef.current) {
            inputRef.current.value = defaultValue?.toString() || ''
        }
    }, [defaultValue, inputRef.current])
    return (
        <LabelWrapper label={null} error={error} className="max-w-xs">
            <Input
                ref={inputRef}
                type="number"
                placeholder={`Enter score (0-${maxScore})`}
                className="hide-arrows"
                onBlur={onBlur}
            />
        </LabelWrapper>
    )
}
