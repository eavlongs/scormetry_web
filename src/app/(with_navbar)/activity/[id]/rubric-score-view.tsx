'use client'

import TinyEditor from '@/components/tiny-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { RubricScoreSchema } from '@/schema'
import { GetRubric, IndividualOrGroup, ScoringEntity } from '@/types/classroom'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { z } from 'zod'

import {
    RubricScoreProvider,
    useRubricScoreContext,
} from './score/rubric-score-provider'

interface RubricScoreInputProps {
    rubric: GetRubric
    entity: ScoringEntity
}

export function RubricScoreView({
    rubric,
    entity,
    initialScores,
    ...props
}: RubricScoreInputProps & {
    initialScores: z.infer<typeof RubricScoreSchema>[] | undefined
} & React.ComponentProps<'div'>) {
    const [scores, setScores] = useState<z.infer<typeof RubricScoreSchema>[]>(
        initialScores ?? []
    )

    useEffect(() => {
        setScores(initialScores ?? [])
    }, [initialScores])

    return (
        <RubricScoreProvider
            value={{
                initialScores: initialScores || [],
                assignment_type: entity.type,
                scores: scores,
                errors: [],

                updateScore: () => {},
                setErrors: () => {},
                addOrReplaceError: () => {},
                removeError: () => {},
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
                <h3 className="text-base underline font-bold mb-2">Note</h3>
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
    const score = (() => {
        const idx = ctx.scores.findIndex(
            (s) => s.assignee_id === assignee_id && s.type === type
        )

        if (idx === -1) return ''

        const scoreIdx = ctx.scores[idx].scores.findIndex(
            (s) => s.rubric_criteria_id === criteria.id
        )

        if (scoreIdx === -1) return ''

        return ctx.scores[idx].scores[scoreIdx].score.toString()
    })()

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

    return (
        <div className={cn('flex', isMobile && 'overflow-x-auto')}>
            {/* Criteria name */}
            <div className="border py-2 px-2 bg-muted/10 flex flex-col justify-center items-center text-xs gap-y-4 w-[15rem]">
                <div>
                    <p className="text-base font-medium text-center">
                        {`${criteria.name} (${criteria.max_score})`}
                    </p>
                </div>
                <LabelWrapper label={null} className="w-4/5">
                    <Input
                        id={criteria.id + assignee_id}
                        className="w-full text-sm focus-visible:ring-0 focus-visible:border-input text-center hide-arrows"
                        type="number"
                        min={criteria.min_score}
                        max={criteria.max_score}
                        readOnly
                        value={(() => {
                            const scoreNum = parseFloat(score)
                            if (isNaN(scoreNum)) return ''

                            if (
                                scoreNum >= criteria.min_score &&
                                scoreNum <= criteria.max_score
                            )
                                return score
                            return ''
                        })()}
                    />
                </LabelWrapper>
                {scoreRange && (
                    <Badge className="text-sm text-center" variant="paragon">
                        {scoreRange.name}
                    </Badge>
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
