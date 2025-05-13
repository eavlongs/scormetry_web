'use client'

import QuillEditor from '@/components/quill-editor'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { GetRubric, ScoringEntity } from '@/types/classroom'
import Image from 'next/image'
import React, { useState } from 'react'

interface RubricScoreInputProps {
    rubric: GetRubric
    entity: ScoringEntity
}

export function RubricScoreInput({
    rubric,
    entity,
    ...props
}: RubricScoreInputProps & React.ComponentProps<'div'>) {
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

    return (
        <div {...props} className="flex flex-col gap-y-4 ">
            {entity.type == 'group' ? (
                <Tabs defaultValue="group" className="w-full">
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
                    />
                ))
            )}

            <div>
                <h3 className="text-base underline font-bold mb-2">Note</h3>
                <QuillEditor
                    className="w-full"
                    initialContent={JSON.parse(rubric.note)}
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
}: {
    section: GetRubric['rubric_sections'][number]
    hasWeightage: boolean
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
                    <RubricCriteria key={criteria.id} criteria={criteria} />
                ))}
            </div>
        </div>
    )
}

interface RubricCriteriaProps {
    criteria: GetRubric['rubric_sections'][number]['rubric_criterias'][number]
}

export function RubricCriteria({ criteria }: RubricCriteriaProps) {
    return (
        <div className="flex">
            {/* Criteria name */}
            <div className="border p-3 bg-muted/10 flex items-center text-xs gap-y-1 relative">
                <p className="text-base font-medium w-32 lg:w-40 text-center">
                    {criteria.name}
                </p>
            </div>

            {/* Score range blocks */}
            <div className="flex w-full overflow-x-auto">
                {criteria.criteria_score_ranges.map((range) => (
                    <div
                        key={range.id}
                        className="border p-3 flex-shrink-0 relative w-[15rem]"
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <p className="border-0 p-1 h-auto focus-visible:ring-0 text-sm font-medium placeholder:text-gray-400 mb-2 text-center line-clamp-1">
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

                        <LabelWrapper
                            label={null}
                            error={
                                ''
                                //     getErrorMessageFromNestedPathValidationError(
                                //     ctx.errors,
                                //     [
                                //         'rubric_sections',
                                //         sectionIndex,
                                //         'rubric_criterias',
                                //         index,
                                //         'name',
                                //     ]
                                // )
                            }
                            options={{
                                error_display: 'tooltip',
                            }}
                        >
                            <Input
                                className="text-sm focus-visible:ring-0 focus-visible:border-input text-center hide-arrows"
                                type="number"
                            />
                        </LabelWrapper>
                    </div>
                ))}
            </div>
        </div>
    )
}
