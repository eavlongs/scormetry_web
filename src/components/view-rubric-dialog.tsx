'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { GetRubric } from '@/types/classroom'
import { X } from 'lucide-react'
import { useState } from 'react'
import TinyEditor from './tiny-editor'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip'

interface ViewRubricDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    isIndividualWork: boolean
    rubric: GetRubric
}

export function ViewRubricDialog({
    open,
    onOpenChange,
    isIndividualWork,
    rubric,
}: ViewRubricDialogProps) {
    const [sections] = useState<GetRubric['rubric_sections']>(
        rubric.rubric_sections
    )
    const [hasWeigtage] = useState<boolean>(rubric.has_weightage)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-screen h-screen !max-w-none flex flex-col p-0 m-0 rounded-none overflow-y-auto">
                <DialogHeader className="px-6 py-2 border-b sticky top-0 bg-background z-10">
                    <div className="flex items-center">
                        <DialogTitle>Rubric</DialogTitle>
                        <Button
                            className="ml-auto"
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-4 pt-0 flex flex-col gap-y-4">
                    {sections.map((section) => (
                        <RubricSection
                            key={section.id}
                            section={section}
                            isIndividualWork={isIndividualWork}
                            hasWeightage={hasWeigtage}
                        />
                    ))}

                    <div>
                        <h3 className="text-base underline font-bold mb-2">
                            Note
                        </h3>
                        <TinyEditor
                            initialContent={rubric.note}
                            readOnly
                            placeholder="Not available"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function RubricSection({
    section,
    hasWeightage,
    isIndividualWork,
}: {
    section: GetRubric['rubric_sections'][number]
    hasWeightage: boolean
    isIndividualWork: boolean
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
                        {!isIndividualWork && (
                            <div className="flex items-center gap-2 ml-2 mb-2 text-sm">
                                <Badge variant="paragon">
                                    {section.is_group_score
                                        ? 'Group'
                                        : 'Individual'}
                                    {' Score'}
                                </Badge>
                            </div>
                        )}
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
                            {`${criteria.name} (${criteria.max_score})`}
                        </p>
                    </div>

                    {/* Score range blocks */}
                    <div className="flex overflow-x-auto">
                        {criteria.criteria_score_ranges.map((range) => (
                            <div
                                key={range.id}
                                className="border p-3 flex-shrink-0 relative w-[12rem] h-[8rem] flex items-center justify-center"
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
                                        {range.description.length > 0 && (
                                            <TooltipContent>
                                                <p>{range.description}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
