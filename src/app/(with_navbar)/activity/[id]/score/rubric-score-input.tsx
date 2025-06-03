'use client'

import TinyEditor from '@/components/tiny-editor'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { getErrorMessageFromNestedPathValidationError } from '@/lib/utils'
import { RubricScoreSchema } from '@/schema'
import { GetRubric, IndividualOrGroup, ScoringEntity } from '@/types/classroom'
import { NestedPathValidationError } from '@/types/response'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import {
    RubricScoreContextType,
    RubricScoreProvider,
    useRubricScoreContext,
} from './rubric-score-provider'

interface RubricScoreInputProps {
    rubric: GetRubric
    entity: ScoringEntity
}

export function RubricScoreInput({
    rubric,
    entity,
    onScoreUpdate,
    parentErrors,
    onSetParentErrors,
    initialScores,
    ...props
}: RubricScoreInputProps & {
    initialScores: z.infer<typeof RubricScoreSchema>[] | undefined
    onScoreUpdate: (scores: RubricScoreContextType['scores']) => void
    parentErrors: NestedPathValidationError[]
    onSetParentErrors: () => void
} & React.ComponentProps<'div'>) {
    const [scores, setScores] = useState<z.infer<typeof RubricScoreSchema>[]>(
        initialScores ?? []
    )

    const [errors, setErrors] = useState<NestedPathValidationError[]>([])

    const [sync, setSync] = useState(false)

    useEffect(() => {
        if (parentErrors.length > 0) {
            for (const error of parentErrors) {
                addOrReplaceError(error)
            }
            onSetParentErrors()
        }
    }, [parentErrors])

    useEffect(() => {
        onScoreUpdate(scores)
    }, [scores])

    function updateScore(
        id: string,
        type: IndividualOrGroup,
        criteria_id: string,
        scoreStr: string
    ) {
        if (scoreStr === '') {
            setScores((prev) => {
                const index = prev.findIndex(
                    (s) => s.assignee_id === id && s.type == type
                )
                if (index !== -1) {
                    const updatedScores = [...prev]
                    updatedScores[index].scores = updatedScores[
                        index
                    ].scores.filter((s) => s.rubric_criteria_id !== criteria_id)

                    if (updatedScores[index].scores.length === 0) {
                        updatedScores.splice(index, 1)
                    }
                    return updatedScores
                }
                return prev
            })

            return
        }

        const score = parseFloat(scoreStr)

        if (isNaN(score)) {
            throw new Error('Score must be a number')
        }

        setScores((prev) => {
            const index = prev.findIndex(
                (s) => s.assignee_id === id && s.type == type
            )
            let newScores

            if (index !== -1) {
                const updatedScores = [...prev]
                const hasExistingScore = updatedScores[index].scores.find(
                    (s) => s.rubric_criteria_id === criteria_id
                )

                let newScoresArray: (typeof prev)[number]['scores']
                if (hasExistingScore) {
                    newScoresArray = updatedScores[index].scores.map((s) => {
                        if (s.rubric_criteria_id === criteria_id) {
                            return {
                                ...s,
                                score: score,
                            }
                        }

                        return s
                    })
                } else {
                    newScoresArray = [
                        ...updatedScores[index].scores,
                        {
                            rubric_criteria_id: criteria_id,
                            score: score,
                        },
                    ]
                }

                updatedScores[index] = {
                    ...updatedScores[index],
                    scores: newScoresArray,
                }
                console.log(newScoresArray)
                newScores = updatedScores
            } else {
                newScores = [
                    ...prev,
                    {
                        assignee_id: id,
                        type: type,
                        scores: [
                            {
                                rubric_criteria_id: criteria_id,
                                score: score,
                            },
                        ],
                    },
                ]
            }
            return newScores
        })
    }

    function addOrReplaceError(error: NestedPathValidationError) {
        setErrors((prev) => {
            const index = prev.findIndex(
                (e) => e.field.join(',') === error.field.join(',')
            )
            if (index !== -1) {
                prev[index] = error
                return [...prev]
            }
            return [...prev, error]
        })
    }

    function removeError(path: NestedPathValidationError['field']) {
        setErrors((prev) => {
            const filtered = prev.filter(
                (e) => e.field.join(',') !== path.join(',')
            )

            return filtered
        })
    }

    const contextValue = useMemo(
        () => ({
            assignment_type: entity.type,
            scores: scores,
            errors: errors,
            updateScore: updateScore,
            syncStatus: sync,
            syncScore: () => {
                setSync((prev) => !prev)
            },
            setErrors: setErrors,
            addOrReplaceError: addOrReplaceError,
            removeError: removeError,
        }),
        [
            entity.type,
            scores,
            errors,
            sync,
            updateScore,
            setSync,
            addOrReplaceError,
            removeError,
        ]
    )

    return (
        <RubricScoreProvider value={contextValue}>
            <_RubricScoreInput {...props} rubric={rubric} entity={entity} />
        </RubricScoreProvider>
    )
}

function _RubricScoreInput({
    rubric,
    entity,
    ...props
}: RubricScoreInputProps & React.ComponentProps<'div'>) {
    const [tab, setTab] = useState<string>('group')

    const [sections] = useState<GetRubric['rubric_sections']>(
        rubric.rubric_sections
    )
    const [groupScoreSections] = useState<GetRubric['rubric_sections']>(
        rubric.rubric_sections.filter((s) => s.is_group_score)
    )
    const [individualScoreSections] = useState<GetRubric['rubric_sections']>(
        rubric.rubric_sections.filter((s) => !s.is_group_score)
    )
    const [hasWeigtage] = useState<boolean>(rubric.has_weightage)

    const ctx = useRubricScoreContext()
    return (
        <div {...props} className="flex flex-col gap-y-4 ">
            {entity.type == 'group' ? (
                <Tabs
                    value={tab}
                    onValueChange={(val) => {
                        ctx.syncScore()
                        setTimeout(() => {
                            setTab(val)
                        }, 0)
                    }}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="group">Group Score</TabsTrigger>
                        <TabsTrigger value="individual">
                            Individual Score
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="group" className="w-full">
                        {groupScoreSections.map((section) => (
                            <RubricSection
                                key={section.id}
                                section={section}
                                hasWeightage={hasWeigtage}
                                assignee_id={entity.entity.id}
                                type="group"
                            />
                        ))}
                    </TabsContent>
                    <TabsContent value="individual">
                        <div className="flex flex-col gap-y-6 mt-2">
                            {entity.entity.users.map((student) => {
                                return (
                                    <div
                                        key={student.id}
                                        className="flex flex-col gap-y-2"
                                    >
                                        <div className="flex items-center gap-x-2">
                                            <div className="relative h-8 w-8 cursor-pointer">
                                                <Image
                                                    src={
                                                        student.profile_picture
                                                    }
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
                                        {individualScoreSections.map(
                                            (section) => (
                                                <RubricSection
                                                    key={section.id}
                                                    section={section}
                                                    hasWeightage={hasWeigtage}
                                                    assignee_id={student.id}
                                                    type="individual"
                                                />
                                            )
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </TabsContent>
                </Tabs>
            ) : (
                sections.map((section) => (
                    <RubricSection
                        key={section.id}
                        section={section}
                        hasWeightage={hasWeigtage}
                        assignee_id={entity.entity.id}
                        type="individual"
                    />
                ))
            )}

            <div>
                <h3 className="text-base underline font-bold mb-2">
                    Rubric Note
                </h3>
                <TinyEditor
                    initialContent={rubric.note}
                    readOnly
                    placeholder="Not available"
                />
            </div>
        </div>
    )
}

function RubricSection({
    section,
    hasWeightage,
    assignee_id,
    type,
}: {
    section: GetRubric['rubric_sections'][number]
    hasWeightage: boolean
    assignee_id: string
    type: IndividualOrGroup
}) {
    return (
        <div className="flex w-full">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-col items-center p-3 rounded-none bg-paragon text-white">
                            <div className="[writing-mode:vertical-rl] text-lg font-semibold flex-grow flex items-center justify-center gap-x-1 relative">
                                <div>
                                    {hasWeightage && (
                                        <p className="text-center font-semibold bg-transparent text-sm rotate-180">
                                            {section.score_percentage}%
                                        </p>
                                    )}
                                    <p className="text-center font-semibold bg-transparent text-sm rotate-180">
                                        {section.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[20rem]">
                        <p className="font-bold text-center text-base mb-1">
                            {section.name}
                            {hasWeightage && ` (${section.score_percentage}%)`}
                        </p>

                        <p className="text-center">{section.description}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="w-full min-w-0">
                {/* <div className="ml-2 mb-2 text-sm">
                    <Badge variant="paragon">
                        {section.is_group_score ? 'Group' : 'Individual'}
                        {' Score'}
                    </Badge>
                </div> */}

                {section.rubric_criterias.map((criteria) => (
                    <RubricCriteria
                        key={criteria.id}
                        criteria={criteria}
                        assignee_id={assignee_id}
                        type={type}
                    />
                ))}
            </div>
        </div>
    )
}

interface RubricCriteriaProps {
    criteria: GetRubric['rubric_sections'][number]['rubric_criterias'][number]
    assignee_id: string
    type: IndividualOrGroup
}

export function RubricCriteria({
    criteria,
    assignee_id,
    type,
}: RubricCriteriaProps) {
    const ctx = useRubricScoreContext()
    const [score, setScore] = useState<string>(() => {
        const idx = ctx.scores.findIndex(
            (s) => s.assignee_id === assignee_id && s.type === type
        )

        if (idx === -1) return ''

        const scoreIdx = ctx.scores[idx].scores.findIndex(
            (s) => s.rubric_criteria_id === criteria.id
        )

        if (scoreIdx === -1) return ''

        return ctx.scores[idx].scores[scoreIdx].score.toString()
    })

    const path = ['criteria', criteria.id, 'assignee', assignee_id]
    let scoreRange = null
    const scoreNum = parseFloat(score)
    if (!isNaN(scoreNum)) {
        for (let i = 0; i < criteria.criteria_score_ranges.length; i++) {
            const isLastIndex = i === criteria.criteria_score_ranges.length - 1
            const range = criteria.criteria_score_ranges[i]

            if (
                !isLastIndex &&
                scoreNum >= range.min_score &&
                scoreNum < range.max_score + 1
            ) {
                scoreRange = range
                break
            }

            if (
                isLastIndex &&
                scoreNum >= range.min_score &&
                scoreNum <= range.max_score
            ) {
                scoreRange = range
                break
            }
        }
    }

    useEffect(() => {
        ctx.updateScore(assignee_id, type, criteria.id, score)
    }, [ctx.syncStatus])

    return (
        <div className="flex">
            {/* Criteria name */}
            <div className="border py-4 px-2 bg-muted/10 flex flex-col justify-center items-center text-xs gap-y-4">
                <div>
                    <p className="text-base font-medium w-[15rem] text-center">
                        {`${criteria.name} (${criteria.max_score})`}
                    </p>
                    {/* {(() => {
                                const scoreNum = parseFloat(score)
                                if (
                                    getErrorMessageFromNestedPathValidationError(
                                        ctx.errors,
                                        path
                                    ) ||
                                    isNaN(scoreNum) ||
                                    !(
                                        scoreNum >= criteria.min_score &&
                                        scoreNum <= criteria.max_score
                                    )
                                )
                                    return null

                                if (!scoreRange) return null
                                return (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {scoreRange.name}
                                    </p>
                                )
                            })()} */}
                </div>
                <LabelWrapper
                    label={null}
                    error={getErrorMessageFromNestedPathValidationError(
                        ctx.errors,
                        path
                    )}
                    options={{
                        error_display: 'over-label',
                    }}
                    className="w-4/5"
                >
                    <Input
                        id={criteria.id + assignee_id}
                        className="w-full text-sm focus-visible:ring-0 focus-visible:border-input text-center hide-arrows"
                        type="number"
                        min={criteria.min_score}
                        max={criteria.max_score}
                        defaultValue={(() => {
                            const scoreNum = parseFloat(score)
                            if (isNaN(scoreNum)) return ''

                            if (
                                scoreNum >= criteria.min_score &&
                                scoreNum <= criteria.max_score
                            )
                                return score
                            return ''
                        })()}
                        onBlur={(e) => {
                            if (e.target.value == '') {
                                setScore('')
                                ctx.removeError(path)
                                ctx.updateScore(
                                    assignee_id,
                                    type,
                                    criteria.id,
                                    e.target.value
                                )
                                return
                            }
                            const scoreNum = parseFloat(e.target.value)
                            if (isNaN(scoreNum)) {
                                ctx.addOrReplaceError({
                                    field: path,
                                    message: 'Score must be a number',
                                })
                                return
                            }

                            console.log('scoreNum', scoreNum)
                            if (
                                scoreNum >= criteria.min_score &&
                                scoreNum <= criteria.max_score
                            ) {
                                setScore(e.target.value)
                                ctx.removeError(path)
                            } else {
                                setScore(e.target.value)

                                setTimeout(() => {
                                    ctx.addOrReplaceError({
                                        field: path,
                                        message:
                                            'Score should be between ' +
                                            criteria.min_score +
                                            ' and ' +
                                            criteria.max_score,
                                    })
                                }, 0)
                            }

                            ctx.updateScore(
                                assignee_id,
                                type,
                                criteria.id,
                                e.target.value
                            )
                        }}
                    />
                </LabelWrapper>
            </div>

            {/* Score range blocks */}
            <div className="flex w-full overflow-x-auto">
                {criteria.criteria_score_ranges.map((range) => {
                    return (
                        <div
                            key={range.id}
                            className="border p-3 flex-shrink-0 w-[10rem] flex flex-col justify-center"
                        >
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <p className="border-0 p-1  focus-visible:ring-0 text-sm font-medium placeholder:text-gray-400 mb-2 text-center line-clamp-1">
                                                {range.name}
                                            </p>

                                            <div className="flex items-center justify-center mb-3 text-sm text-muted-foreground gap-x-1">
                                                <p className="p-0 h-auto focus-visible:ring-0 text-center w-6 text-sm">
                                                    {range.min_score}
                                                </p>
                                                -
                                                <p className="p-0 h-auto focus-visible:ring-0 text-center w-6 text-sm">
                                                    {range.max_score}
                                                </p>
                                            </div>
                                        </div>
                                    </TooltipTrigger>

                                    <TooltipContent className="max-w-[20rem]">
                                        <p className="font-bold text-center text-base mb-1">
                                            {`${range.name} (${range.min_score} - ${range.max_score})`}
                                        </p>
                                        <p className="text-center">
                                            {range.description}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
