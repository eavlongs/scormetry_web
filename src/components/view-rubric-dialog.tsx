'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { GetRubric } from '@/types/classroom'
import { useEffect, useState } from 'react'
import QuillEditor from './quill-editor'
import { Badge } from './ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip'
import { Textarea } from './ui/textarea'

interface ViewRubricDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    rubric: GetRubric
}

export function ViewRubricDialog({
    open,
    onOpenChange,
    rubric,
}: ViewRubricDialogProps) {
    const [sections] = useState<GetRubric['rubric_sections']>(
        rubric.rubric_sections
    )
    const [hasWeigtage] = useState<boolean>(rubric.has_weightage)

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="min-w-[900px] max-w-[70vw] max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <DialogTitle>Rubric</DialogTitle>
                    <div className="flex-1 overflow-auto p-4 px-0 pt-0 flex flex-col gap-y-4">
                        {sections.map((section) => (
                            <RubricSection
                                key={section.id}
                                section={section}
                                hasWeightage={hasWeigtage}
                            />
                        ))}

                        <div>
                            <h3 className="text-base underline font-bold mb-2">
                                Note
                            </h3>
                            <QuillEditor
                                className=" w-full"
                                initialContent={JSON.parse(rubric.note)}
                                readOnly
                                placeholder="Not available"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
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
        <div>
            <div className="flex">
                <div className="flex flex-col items-center justify-start p-3 rounded-none bg-paragon text-white">
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

                <div>
                    <div>
                        <div className="flex items-center gap-2 ml-2 mb-2 text-sm">
                            <Badge variant="paragon">
                                {section.is_group_score
                                    ? 'Group'
                                    : 'Individual'}
                                {' Score'}
                            </Badge>
                        </div>
                    </div>
                    {section.rubric_criterias.map((criteria) => (
                        <RubricCriteria key={criteria.id} criteria={criteria} />
                    ))}
                </div>
            </div>
        </div>
    )
}

interface RubricCriteriaProps {
    criteria: GetRubric['rubric_sections'][number]['rubric_criterias'][number]
}

export function RubricCriteria({ criteria }: RubricCriteriaProps) {
    return (
        <div>
            <div className="flex">
                <div className="flex-1 flex">
                    {/* Criteria name */}
                    <div className="border p-3 bg-muted/10 flex items-center text-xs gap-y-1 relative">
                        <p className="text-base font-medium w-48 text-center">
                            {criteria.name}
                        </p>
                    </div>

                    {/* Score range blocks */}
                    <div className="flex overflow-x-auto">
                        {criteria.criteria_score_ranges.map((range) => (
                            <div
                                key={range.id}
                                className="border p-3 flex-shrink-0 relative"
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="border-0 p-1 h-auto max-w-[180px] focus-visible:ring-0 text-sm font-medium placeholder:text-gray-400">
                                                        {range.name}
                                                    </p>
                                                </div>

                                                <div className="flex items-center mb-3 text-sm text-muted-foreground gap-x-1">
                                                    <p className="p-0 h-auto focus-visible:ring-0 text-center w-12 text-sm">
                                                        {range.min_score}
                                                    </p>
                                                    -
                                                    <p className="p-0 h-auto focus-visible:ring-0 text-center w-12 text-sm">
                                                        {range.max_score}
                                                    </p>
                                                    <span className="ml-1">
                                                        points
                                                    </span>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        {range.description.length > 0 && (
                                            <TooltipContent>
                                                <p>{range.description}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>

                                <Textarea
                                    value={range.description}
                                    maxLength={255}
                                    readOnly
                                    className="min-h-[80px] field-sizing-fixed resize-none text-sm focus-visible:ring-0 focus-visible:border-input"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
