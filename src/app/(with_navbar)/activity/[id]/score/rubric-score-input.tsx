'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import TinyEditor from '@/components/tiny-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Slider } from '@/components/ui/slider'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn, getErrorMessageFromNestedPathValidationError } from '@/lib/utils'
import { RubricScoreSchema } from '@/schema'
import { GetRubric, IndividualOrGroup, ScoringEntity } from '@/types/classroom'
import { NestedPathValidationError } from '@/types/response'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import {
    RubricScoreContextType,
    RubricScoreProvider,
    useRubricScoreContext,
} from './rubric-score-provider'
import { useScoreInputVisibilityContext } from './visibility-provider'

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
        initialScores ? [...initialScores] : []
    )

    const [groupScoreSections] = useState<GetRubric['rubric_sections']>(
        rubric.rubric_sections.filter((s) => s.is_group_score)
    )
    const [individualScoreSections] = useState<GetRubric['rubric_sections']>(
        rubric.rubric_sections.filter((s) => !s.is_group_score)
    )

    const { triggerHideAll, hide: hideScore } = useScoreInputVisibilityContext()
    useEffect(() => {
        console.log('triggerHideAll', triggerHideAll)
        if (triggerHideAll === null) return

        const ids: string[] = []

        if (entity.type === 'group') {
            groupScoreSections.forEach((section) => {
                section.rubric_criterias.forEach((criteria) => {
                    ids.push(`${criteria.id}-${entity.entity.id}`)
                })
            })

            individualScoreSections.forEach((section) => {
                section.rubric_criterias.forEach((criteria) => {
                    entity.entity.users.forEach((user) => {
                        ids.push(`${criteria.id}-${user.id}`)
                    })
                })
            })
        } else {
            individualScoreSections.forEach((section) => {
                section.rubric_criterias.forEach((criteria) => {
                    ids.push(`${criteria.id}-${entity.entity.id}`)
                })
            })
        }

        if (ids.length > 0) hideScore(ids)
    }, [triggerHideAll])

    const [errors, setErrors] = useState<NestedPathValidationError[]>([])

    useEffect(() => {
        if (parentErrors.length > 0) {
            for (const error of parentErrors) {
                addOrReplaceError(error)
            }
            onSetParentErrors()
        }
    }, [parentErrors])

    useEffect(() => {
        console.table(scores)
        onScoreUpdate(scores)
    }, [scores])

    function updateScore(
        id: string,
        type: IndividualOrGroup,
        criteria_id: string,
        scoreStr: string
    ) {
        console.log('updateScore called')
        console.log({ id, type, criteria_id, scoreStr })
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
            let newScores: typeof scores

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

    return (
        <RubricScoreProvider
            value={{
                initialScores: initialScores || [],
                assignment_type: entity.type,
                scores: scores,
                errors: errors,
                updateScore: updateScore,
                setErrors: setErrors,
                addOrReplaceError: addOrReplaceError,
                removeError: removeError,
            }}
        >
            <_RubricScoreInput {...props} rubric={rubric} entity={entity} />
        </RubricScoreProvider>
    )
}

function _RubricScoreInput({
    rubric,
    entity,
    ...props
}: RubricScoreInputProps & React.ComponentProps<'div'>) {
    const [tab, setTab] = useState<'group' | 'individual'>(
        rubric.rubric_sections.filter((s) => s.is_group_score).length > 0
            ? 'group'
            : 'individual'
    )

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

    useEffect(() => {
        console.error(ctx.initialScores)
    }, [ctx.initialScores])
    return (
        <div {...props} className="flex flex-col gap-y-4 ">
            {entity.type == 'group' ? (
                <>
                    <div
                        className={cn(
                            'w-full grid',
                            rubric.rubric_sections.filter(
                                (s) => s.is_group_score
                            ).length > 0 &&
                                rubric.rubric_sections.filter(
                                    (s) => !s.is_group_score
                                ).length > 0 &&
                                'grid-cols-2'
                        )}
                    >
                        {rubric.rubric_sections.filter((s) => s.is_group_score)
                            .length > 0 && (
                            <Button
                                variant="outline"
                                className={cn(
                                    tab == 'group' &&
                                        'bg-paragon text-white hover:bg-paragon-hover hover:text-white'
                                )}
                                onClick={() => setTab('group')}
                            >
                                Group Score
                            </Button>
                        )}
                        {rubric.rubric_sections.filter((s) => !s.is_group_score)
                            .length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setTab('individual')}
                                className={cn(
                                    tab == 'individual' &&
                                        'bg-paragon text-white hover:bg-paragon-hover hover:text-white'
                                )}
                            >
                                Individual Score
                            </Button>
                        )}
                    </div>
                    <div
                        className={cn(
                            'w-full hidden',
                            tab == 'group' && 'block'
                        )}
                    >
                        {groupScoreSections.map((section) => (
                            <RubricSection
                                key={section.id}
                                section={section}
                                hasWeightage={hasWeigtage}
                                assignee_id={entity.entity.id}
                                type="group"
                            />
                        ))}
                    </div>
                    <div
                        className={cn(
                            'hidden gap-y-6 mt-2',
                            tab == 'individual' && 'flex flex-col'
                        )}
                    >
                        {entity.entity.users.map((student) => {
                            return (
                                <div
                                    key={student.id}
                                    className="flex flex-col gap-y-4"
                                >
                                    <div className="flex items-center gap-x-2 justify-center">
                                        <div className="relative h-10 w-10 cursor-pointer">
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
                                        <span className="font-bold text-2xl">
                                            {student.first_name +
                                                ' ' +
                                                student.last_name}
                                        </span>
                                    </div>
                                    {individualScoreSections.map((section) => (
                                        <RubricSection
                                            key={section.id}
                                            section={section}
                                            hasWeightage={hasWeigtage}
                                            assignee_id={student.id}
                                            type="individual"
                                        />
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </>
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
            <div className="flex flex-col items-center p-3 rounded-none bg-paragon text-white min-w-16">
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
    const isMobile = useIsMobile()

    let score = ''
    const idx = ctx.scores.findIndex(
        (s) => s.assignee_id === assignee_id && s.type === type
    )

    if (idx !== -1) {
        const scoreIdx = ctx.scores[idx].scores.findIndex(
            (s) => s.rubric_criteria_id === criteria.id
        )

        if (scoreIdx !== -1)
            score = ctx.scores[idx].scores[scoreIdx].score.toString()
    }

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

    const {
        itemsToHide,
        show: showScore,
        hide: hideScore,
    } = useScoreInputVisibilityContext()

    const scoreIsHidden = itemsToHide.has(`${criteria.id}-${assignee_id}`)

    return (
        <div className={cn('flex', isMobile && 'overflow-x-auto')}>
            {/* Criteria name */}
            <div className="border py-2 px-2 bg-muted/10 flex flex-col justify-center items-center text-xs gap-y-4 min-w-[10rem] w-[15rem] max-w-[15rem]">
                <div className="flex items-center gap-x-1">
                    <p
                        className="text-base font-medium text-center"
                        onClick={() => showScore([criteria.id])}
                    >
                        {`${criteria.name} (${criteria.max_score})`}
                    </p>
                    {!scoreIsHidden ? (
                        <SimpleToolTip text="Hide score">
                            <Eye
                                onClick={() =>
                                    hideScore([`${criteria.id}-${assignee_id}`])
                                }
                            />
                        </SimpleToolTip>
                    ) : (
                        <SimpleToolTip text="Show score">
                            <EyeOff
                                onClick={() => {
                                    showScore([`${criteria.id}-${assignee_id}`])
                                }}
                            />
                        </SimpleToolTip>
                    )}
                </div>
                <LabelWrapper
                    label={null}
                    error={getErrorMessageFromNestedPathValidationError(
                        ctx.errors,
                        path
                    )}
                    options={{
                        error_display: 'under-label',
                    }}
                    className={cn('w-4/5', scoreIsHidden && 'hidden')}
                >
                    <Input
                        id={criteria.id + assignee_id}
                        className="w-full text-sm focus-visible:ring-0 focus-visible:border-input text-center hide-arrows"
                        type="number"
                        min={criteria.min_score}
                        max={criteria.max_score}
                        onWheel={(e) => {
                            // @ts-expect-error for some reason blur is not typed in target
                            e.target.blur()
                        }}
                        value={(() => {
                            const idx = ctx.scores.findIndex(
                                (s) =>
                                    s.assignee_id === assignee_id &&
                                    s.type === type
                            )

                            if (idx === -1) return ''

                            const scoreIdx = ctx.scores[idx].scores.findIndex(
                                (s) => s.rubric_criteria_id === criteria.id
                            )

                            if (scoreIdx === -1) return ''

                            console.log(
                                ctx.scores[idx].scores[
                                    scoreIdx
                                ].score.toString()
                            )

                            return ctx.scores[idx].scores[
                                scoreIdx
                            ].score.toString()
                        })()}
                        onChange={(e) => {
                            if (e.target.value == '') {
                                ctx.removeError(path)
                                console.log('called from 2')
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
                                ctx.removeError(path)
                            } else {
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

                            console.log(
                                'called from 1, target value:',
                                e.target.value
                            )
                            ctx.updateScore(
                                assignee_id,
                                type,
                                criteria.id,
                                e.target.value
                            )
                        }}
                    />

                    <Slider
                        min={criteria.min_score}
                        max={criteria.max_score}
                        step={0.1}
                        onValueChange={(val) => {
                            if (val.length == 0) return
                            const scoreNum = val[0]
                            if (
                                scoreNum >= criteria.min_score &&
                                scoreNum <= criteria.max_score
                            ) {
                                ctx.removeError(path)
                            } else {
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
                                scoreNum.toString()
                            )
                        }}
                        value={[
                            (() => {
                                const idx = ctx.scores.findIndex(
                                    (s) =>
                                        s.assignee_id === assignee_id &&
                                        s.type === type
                                )

                                if (idx === -1) return 0

                                const scoreIdx = ctx.scores[
                                    idx
                                ].scores.findIndex(
                                    (s) => s.rubric_criteria_id === criteria.id
                                )

                                if (scoreIdx === -1) return 0

                                console.log(
                                    ctx.scores[idx].scores[
                                        scoreIdx
                                    ].score.toString()
                                )

                                return ctx.scores[idx].scores[scoreIdx].score
                            })(),
                        ]}
                    />
                </LabelWrapper>
                {scoreRange && !scoreIsHidden && (
                    <Badge className="text-sm text-center" variant="paragon">
                        {scoreRange.name}
                    </Badge>
                )}

                {scoreIsHidden && (
                    <span
                        className="cursor-pointer"
                        onClick={() =>
                            showScore([`${criteria.id}-${assignee_id}`])
                        }
                    >
                        ***
                    </span>
                )}
            </div>

            {/* Score range blocks */}
            <div className={cn('flex w-full', !isMobile && 'overflow-x-auto')}>
                {criteria.criteria_score_ranges.map((range) => {
                    return (
                        <div
                            key={range.id}
                            className={cn(
                                'border p-2 flex-shrink-0 w-[15rem] flex flex-col justify-start',
                                scoreRange &&
                                    !scoreIsHidden &&
                                    scoreRange.id == range.id &&
                                    'border-paragon border-1'
                            )}
                        >
                            <div>
                                <p className="border-0 p-1 focus-visible:ring-0 text-sm font-bold placeholder:text-gray-400 text-center line-clamp-1">
                                    {range.name}
                                </p>

                                <div className="flex items-center justify-center mb-1 text-sm text-muted-foreground gap-x-1">
                                    <p className="p-0 h-auto focus-visible:ring-0 text-center w-6 text-sm">
                                        {range.min_score}
                                    </p>
                                    -
                                    <p className="p-0 h-auto focus-visible:ring-0 text-center w-6 text-sm">
                                        {range.max_score}
                                    </p>
                                </div>
                            </div>

                            <div className="text-sm overflow-y-auto h-[120px]">
                                {range.description.length > 0 ? (
                                    range.description
                                ) : (
                                    <p className="text-gray-600 text-center mt-2">
                                        (No Description)
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
