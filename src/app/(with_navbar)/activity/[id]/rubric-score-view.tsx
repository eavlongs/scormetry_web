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
                assignment_type: entity.type,
                scores: scores,
                errors: [],

                updateScore: () => {},
                syncStatus: false,
                syncScore: () => {},
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

    return (
        <div className="flex">
            {/* Criteria name */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="border py-4 px-2 bg-muted/10 flex flex-col justify-center items-center text-xs gap-y-4">
                        <div>
                            <p className="text-base font-medium w-[15rem] text-center">
                                {`${criteria.name} (${criteria.max_score})`}
                            </p>
                        </div>
                        <LabelWrapper
                            label={null}
                            error={getErrorMessageFromNestedPathValidationError(
                                ctx.errors,
                                path
                            )}
                            options={{
                                error_display: 'tooltip',
                            }}
                            className="w-4/5"
                        >
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
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[20rem]">
                    <p className="font-bold text-center text-base mb-1">
                        {criteria.name}
                    </p>

                    {!isNaN(scoreNum) && (
                        <p className="text-center">
                            {`${scoreNum}${scoreRange ? ` (${scoreRange.name})` : ''}`}
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>

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
