'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Slider } from '@/components/ui/slider'
import { cn, getErrorMessageFromValidationError } from '@/lib/utils'
import { ScoringEntity } from '@/types/classroom'
import { ValidationError } from '@/types/response'
import { Copy } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useScoreInputVisibilityContext } from './visibility-provider'

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

    function handleOnScoreChange(student_id: string, valueStr: string) {
        console.log(valueStr)
        if (valueStr == '') {
            removeScore(student_id)
            return
        }
        const scoreNum = parseFloat(valueStr)
        console.log(scoreNum)
        if (isNaN(scoreNum)) {
            console.log('here')
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
                    onScoreChange={(e) =>
                        handleOnScoreChange(entity.entity.id, e)
                    }
                    error={getErrorMessageFromValidationError(
                        errors,
                        entity.entity.id
                    )}
                    value={
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
                                <div className="flex items-start">
                                    <ScoreInput
                                        maxScore={maxScore}
                                        onScoreChange={(e) =>
                                            handleOnScoreChange(student.id, e)
                                        }
                                        error={getErrorMessageFromValidationError(
                                            errors,
                                            student.id
                                        )}
                                        value={
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
    onScoreChange,
    error,
    value,
}: {
    maxScore: number
    onScoreChange: (valueStr: string) => void
    error: string
    value?: number | string
}) {
    const { hideScore, show: showScore } = useScoreInputVisibilityContext()

    return (
        <LabelWrapper label={null} error={error} className="w-xs">
            <Input
                min={0}
                max={maxScore}
                value={value}
                type="number"
                onClick={() => showScore()}
                placeholder={`Enter score (0-${maxScore})`}
                className={cn(
                    'hide-arrows',
                    hideScore && 'blur-xs border-black'
                )}
                onChange={(e) => {
                    onScoreChange(e.target.value)
                }}
                onWheel={(e) => {
                    // @ts-expect-error for some reason blur is not typed in target
                    e.target.blur()
                }}
            />
            <Slider
                min={0}
                max={maxScore}
                step={0.1}
                onValueChange={(val) => {
                    if (val.length == 0) return
                    const scoreNum = val[0]

                    onScoreChange(scoreNum.toString())
                }}
                value={[
                    value !== undefined && !isNaN(parseFloat(value.toString()))
                        ? parseFloat(value.toString())
                        : 0,
                ]}
            />
        </LabelWrapper>
    )
}
