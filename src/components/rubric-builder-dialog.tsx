'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    cn,
    convertZodErrorToValidationErrorWithNestedPath,
    getErrorMessageFromNestedPathValidationError,
    getValidationErrorMessage,
} from '@/lib/utils'
import { RubricSchema } from '@/schema'
import { Prettify } from '@/types/general'
import { NestedPathValidationError } from '@/types/response'
import assert from 'assert'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Delta } from 'quill'
import {
    createContext,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { toast } from 'sonner'
import { z, ZodError } from 'zod'
import QuillEditor from './quill-editor'
import { LabelWrapper } from './ui/label-wrapper'

interface ScoreRange {
    name: string
    min_score: number
    max_score: number
    description: string
}

interface Criteria {
    name: string
    criteria_score_ranges: ScoreRange[]
}

interface Section {
    name: string
    score_percentage: number
    is_group_score: boolean
    rubric_criterias: Criteria[]
    description: string
}

interface RubricBuilderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData: z.infer<typeof RubricSchema> | null
    isIndividual: boolean
    onSave: (rubric: z.infer<typeof RubricSchema>) => void
}

type RubricBuilderContextType = {
    rubric_sections: Section[]
    errors: NestedPathValidationError[]
    setSections: React.Dispatch<SetStateAction<Section[]>>
    addSection: () => void
    updateSectionName: (sectionIndex: number, name: string) => void
    removeSection: (sectionIndex: number) => void
    updateScoringType: (sectionIndex: number, is_group_score: boolean) => void
    addCriteria: (sectionIndex: number) => void
    updateCriteriaName: (
        sectionIndex: number,
        criteriaIndex: number,
        name: string
    ) => void
    removeCriteria: (sectionIndex: number, criteriaIndex: number) => void
    updateScoreRangeLabel: (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        label: string
    ) => void
    addScoreRange: (sectionIndex: number, criteriaIndex: number) => void
    removeScoreRange: (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number
    ) => void
    updateScoreRangeMin: (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        min: number
    ) => void
    updateScoreRangeMax: (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        max: number
    ) => void
    updateScoreRangeDescription: (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        description: string
    ) => void
}

const rubricBuilderDefaultValue: RubricBuilderContextType = {
    rubric_sections: [
        {
            name: 'Section 1',
            score_percentage: 0,
            is_group_score: false,
            description: '',
            rubric_criterias: [
                {
                    name: '',
                    criteria_score_ranges: [
                        {
                            name: '',
                            min_score: 1,
                            max_score: 5,
                            description: '',
                        },
                    ],
                },
            ],
        },
    ],
    errors: [],
    setSections: () => {},
    addSection: () => {},
    updateSectionName: () => {},
    removeSection: () => {},
    updateScoringType: () => {},
    updateCriteriaName: () => {},
    addCriteria: () => {},
    removeCriteria: () => {},
    updateScoreRangeLabel: () => {},
    addScoreRange: () => {},
    removeScoreRange: () => {},
    updateScoreRangeMin: () => {},
    updateScoreRangeMax: () => {},
    updateScoreRangeDescription: () => {},
}

const RubricBuilderContext = createContext<RubricBuilderContextType>(
    rubricBuilderDefaultValue
)

export function RubricBuilderDialog({
    open,
    onOpenChange,
    onSave,
    isIndividual,
    initialData,
}: RubricBuilderDialogProps) {
    const [sections, setSections] = useState<Section[]>(
        initialData
            ? initialData.rubric_sections
            : rubricBuilderDefaultValue.rubric_sections
    )
    const [sectionToEdit, setSectionToEdit] = useState<Prettify<
        Pick<Section, 'name' | 'score_percentage' | 'description'> & {
            index: number
        }
    > | null>(null)

    const [note, setNote] = useState<Delta>()
    const [quill, setQuill] = useState()
    const [errors, setErrors] = useState<NestedPathValidationError[]>([])

    useEffect(() => {
        if (open && quill && initialData?.note) {
            // @ts-expect-error quill is not typed, so it will show error when referencing .setContents
            quill.setContents(JSON.parse(initialData.note))
        }
    }, [quill, initialData?.note])

    useEffect(() => {
        if (initialData) {
            setSections(initialData?.rubric_sections || [])
        }
    }, [initialData])

    const addCriteria = (sectionIndex: number) => {
        setSections((prev) => {
            const updatedSections = [...prev]
            updatedSections[sectionIndex] = {
                ...updatedSections[sectionIndex],
                rubric_criterias: [
                    ...updatedSections[sectionIndex].rubric_criterias,
                    {
                        name: '',
                        criteria_score_ranges: [
                            {
                                name: '',
                                min_score: 1,
                                max_score: 5,
                                description: '',
                            },
                        ],
                    },
                ],
            }
            return updatedSections
        })
    }

    const updateCriteriaName = (
        sectionIndex: number,
        criteriaIndex: number,
        name: string
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].rubric_criterias[criteriaIndex].name =
            name
        setSections(updatedSections)
    }

    const removeCriteria = (sectionIndex: number, criteriaIndex: number) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].rubric_criterias.splice(criteriaIndex, 1)
        setSections(updatedSections)
    }

    const updateSectionName = (sectionIndex: number, name: string) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].name = name
        setSections(updatedSections)
    }

    const removeSection = (sectionIndex: number) => {
        setSections((prev) => {
            prev.splice(sectionIndex, 1)
            return [...prev]
        })
    }

    const updateScoringType = (
        sectionIndex: number,
        is_group_score: boolean
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].is_group_score = is_group_score
        setSections(updatedSections)
    }

    const updateScoreRangeLabel = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        label: string
    ) => {
        setSections((prev) => {
            const updatedSections = [...prev]
            updatedSections[sectionIndex].rubric_criterias[
                criteriaIndex
            ].criteria_score_ranges[rangeIndex].name = label
            return updatedSections
        })
    }

    const updateScoreRangeDescription = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        description: string
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].rubric_criterias[
            criteriaIndex
        ].criteria_score_ranges[rangeIndex].description = description
        setSections(updatedSections)
    }

    const updateScoreRangeMin = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        min: number
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].rubric_criterias[
            criteriaIndex
        ].criteria_score_ranges[rangeIndex].min_score = min
        setSections(updatedSections)
    }

    const updateScoreRangeMax = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        max: number
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].rubric_criterias[
            criteriaIndex
        ].criteria_score_ranges[rangeIndex].max_score = max
        setSections(updatedSections)
    }

    const addScoreRange = (sectionIndex: number, criteriaIndex: number) => {
        const updatedSections = [...sections]
        const criteria =
            updatedSections[sectionIndex].rubric_criterias[criteriaIndex]
        const lastRange =
            criteria.criteria_score_ranges[
                criteria.criteria_score_ranges.length - 1
            ]
        const diff = lastRange ? lastRange.max_score - lastRange.min_score : 0

        criteria.criteria_score_ranges.push({
            name: '',
            min_score: lastRange ? lastRange.max_score + 1 : 1,
            max_score: lastRange ? lastRange.max_score + 1 + diff : 5,
            description: '',
        })

        setSections(updatedSections)
    }

    const removeScoreRange = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].rubric_criterias[
            criteriaIndex
        ].criteria_score_ranges.splice(rangeIndex, 1)
        setSections(updatedSections)
    }

    const addSection = () => {
        setSections((prev) => [
            ...prev,
            {
                name: `Section ${prev.length + 1}`,
                score_percentage: 0,
                is_group_score: false,
                description: '',
                rubric_criterias: [
                    {
                        name: '',
                        criteria_score_ranges: [
                            {
                                name: '',
                                min_score:
                                    prev[prev.length - 1].rubric_criterias[0]
                                        .criteria_score_ranges[0].min_score,
                                max_score:
                                    prev[prev.length - 1].rubric_criterias[0]
                                        .criteria_score_ranges[0].max_score,
                                description: '',
                            },
                        ],
                    },
                ],
            },
        ])
    }

    const updateSection = (
        sectionIndex: number,
        name: string,
        score_percentage: number,
        description: string
    ) => {
        setSections((prev) => {
            const updatedSections = [...prev]
            updatedSections[sectionIndex].name = name
            updatedSections[sectionIndex].score_percentage = score_percentage
            updatedSections[sectionIndex].description = description
            return updatedSections
        })

        setSectionToEdit(null)
    }

    return (
        <RubricBuilderContext.Provider
            value={{
                rubric_sections: sections,
                errors,
                setSections,
                addSection,
                updateSectionName,
                removeSection,
                updateScoringType,
                addCriteria,
                updateCriteriaName,
                removeCriteria,
                updateScoreRangeLabel,
                addScoreRange,
                removeScoreRange,
                updateScoreRangeMin,
                updateScoreRangeMax,
                updateScoreRangeDescription,
            }}
        >
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-screen h-screen !max-w-none flex flex-col p-0 m-0 rounded-none">
                    <DialogHeader className="px-6 py-2 border-b sticky top-0 bg-background z-10">
                        <div className="flex items-center">
                            <DialogTitle>Rubric Builder</DialogTitle>
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

                    <div className="flex-1 overflow-auto p-4 px-0 pt-0 pb-20 flex flex-col gap-y-4">
                        {sections.map((section, sectionIndex) => (
                            <RubricSection
                                key={sectionIndex}
                                index={sectionIndex}
                                isIndividual={isIndividual}
                                section={section}
                                onTriggerUpdateSection={() =>
                                    setSectionToEdit({
                                        index: sectionIndex,
                                        name: section.name,
                                        score_percentage:
                                            section.score_percentage,
                                        description: section.description,
                                    })
                                }
                            />
                        ))}

                        <Button
                            variant="outline"
                            className="w-full py-4 text-sm rounded-none"
                            onClick={addSection}
                        >
                            <Plus className="h-3 w-3 mr-2" /> ADD SECTION
                        </Button>

                        <div className="px-4">
                            <h3 className="text-base underline font-bol mb-2">
                                Note
                            </h3>
                            <QuillEditor
                                // placeholder="Add any additional information about this rubric..."
                                className="min-h-[180px] w-full"
                                onContentChange={setNote}
                                initialContent={note}
                                setQuillObject={setQuill}
                            />
                        </div>
                        {/*  */}
                    </div>

                    <div className="border-t p-2 fixed bottom-0 left-0 right-0 bg-background z-10 flex items-center justify-end gap-x-4">
                        <Button
                            variant="destructive"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                try {
                                    setErrors([])
                                    const data = RubricSchema.parse({
                                        note: JSON.stringify(note || []),
                                        rubric_sections: sections,
                                    })
                                    onSave(data)
                                } catch (e) {
                                    assert(e instanceof ZodError)
                                    const validationErrors =
                                        convertZodErrorToValidationErrorWithNestedPath(
                                            e
                                        )
                                    setErrors(validationErrors)
                                    toast.error(
                                        getValidationErrorMessage(
                                            validationErrors
                                        )
                                    )
                                    console.log(validationErrors)
                                }
                            }}
                        >
                            Save Rubric
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <EditSectionDialog
                section={sectionToEdit}
                onClose={() => setSectionToEdit(null)}
                onSubmit={updateSection}
            />
        </RubricBuilderContext.Provider>
    )
}

function RubricSection({
    section,
    index,
    onTriggerUpdateSection,
    isIndividual,
}: {
    section: Section
    index: number
    isIndividual: boolean
    onTriggerUpdateSection: () => void
}) {
    const ctx = useContext(RubricBuilderContext)

    return (
        <div className="mb-4">
            <div className="flex">
                <div className="flex flex-col items-center justify-start p-3 rounded-none bg-paragon text-white">
                    <div className="[writing-mode:vertical-rl] text-lg font-semibold flex-grow flex items-center justify-center gap-x-1 relative">
                        {/* <div className="flex-grow flex flex-col items-center justify-center gap-y-2 relative">
                                <Input
                                    className="h-full text-center font-semibold bg-transparent text-sm rotate-180 placeholder:text-gray-300 hide-arrows"
                                    placeholder="Score Percentage"
                                    type="number"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsEditingSectionName(false)
                                        }
                                    }}
                                    min={0}
                                    max={100}
                                />
                                <Input
                                    className="h-full text-center font-semibold bg-transparent text-sm rotate-180 placeholder:text-gray-300"
                                    value={section.name}
                                    onChange={(e) =>
                                        ctx.updateSectionName(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Section name"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsEditingSectionName(false)
                                        }
                                    }}
                                    ref={sectionNameInputRef}
                                />
                            </div> */}
                        <div className="absolute flex flex-col items-center bottom-2 gap-y-1">
                            {ctx.rubric_sections.length > 1 && (
                                <Trash2
                                    className="inline-block h-4 w-4 cursor-pointer"
                                    onClick={() => ctx.removeSection(index)}
                                />
                            )}
                            <Pencil
                                className="inline-block h-4 w-4 cursor-pointer"
                                onClick={onTriggerUpdateSection}
                            />
                        </div>

                        <div>
                            {ctx.rubric_sections.findIndex(
                                (s) => s.score_percentage !== 0
                            ) !== -1 && (
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
                    <div className="flex-none pl-2 ">
                        {!isIndividual && (
                            <>
                                <div className="flex items-center gap-2 mb-2 text-sm">
                                    {isIndividual}
                                    <span className="mr-2">Scoring Type:</span>
                                    <div className="flex bg-white rounded-full border">
                                        <button
                                            className={cn(
                                                `px-2 py-1 rounded-full cursor-pointer`,
                                                !section.is_group_score
                                                    ? 'bg-paragon text-white'
                                                    : 'text-gray-700'
                                            )}
                                            onClick={() =>
                                                ctx.updateScoringType(
                                                    index,
                                                    false
                                                )
                                            }
                                        >
                                            Individual
                                        </button>
                                        <button
                                            className={cn(
                                                'px-2 py-1 rounded-full cursor-pointer',
                                                section.is_group_score
                                                    ? 'bg-paragon text-white'
                                                    : 'text-gray-700'
                                            )}
                                            onClick={() =>
                                                ctx.updateScoringType(
                                                    index,
                                                    true
                                                )
                                            }
                                        >
                                            Group
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {section.rubric_criterias.map((criteria, criteriaIndex) => (
                        <RubricCriteria
                            key={criteriaIndex}
                            sectionIndex={index}
                            index={criteriaIndex}
                            criteria={criteria}
                        />
                    ))}

                    <Button
                        variant="outline"
                        className="w-full py-4 text-sm rounded-none"
                        onClick={() => ctx.addCriteria(index)}
                    >
                        <Plus className="h-3 w-3 mr-2" /> ADD CRITERIA
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface RubricCriteriaProps {
    criteria: Criteria
    sectionIndex: number
    index: number
}

export function RubricCriteria({
    criteria,
    sectionIndex,
    index,
}: RubricCriteriaProps) {
    const ctx = useContext(RubricBuilderContext)
    return (
        <div>
            <div className="flex">
                <div className="flex-1 flex">
                    {/* Criteria name */}
                    <div className="border p-3 bg-muted/10 flex items-center text-xs gap-y-1 relative">
                        {ctx.rubric_sections[sectionIndex].rubric_criterias
                            .length > 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 absolute top-2 right-2"
                                onClick={() =>
                                    ctx.removeCriteria(sectionIndex, index)
                                }
                            >
                                <Trash2 />
                            </Button>
                        )}
                        <LabelWrapper
                            label={null}
                            error={getErrorMessageFromNestedPathValidationError(
                                ctx.errors,
                                [
                                    'rubric_sections',
                                    sectionIndex,
                                    'rubric_criterias',
                                    index,
                                    'name',
                                ]
                            )}
                            options={{
                                error_display: 'tooltip',
                            }}
                        >
                            <Input
                                value={criteria.name}
                                onChange={(e) =>
                                    ctx.updateCriteriaName(
                                        sectionIndex,
                                        index,
                                        e.target.value
                                    )
                                }
                                maxLength={50}
                                className="text-sm font-medium w-48"
                                placeholder="Criteria name"
                            />
                        </LabelWrapper>
                    </div>

                    {/* Score range blocks */}
                    <div className="flex overflow-x-auto">
                        {criteria.criteria_score_ranges.map(
                            (range, rangeIndex) => (
                                <div
                                    key={rangeIndex}
                                    className="border p-3 flex-shrink-0 relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <LabelWrapper
                                            label={null}
                                            error={getErrorMessageFromNestedPathValidationError(
                                                ctx.errors,
                                                [
                                                    'rubric_sections',
                                                    sectionIndex,
                                                    'rubric_criterias',
                                                    index,
                                                    'criteria_score_ranges',
                                                    rangeIndex,
                                                    'name',
                                                ]
                                            )}
                                            options={{
                                                error_display: 'tooltip',
                                            }}
                                        >
                                            <Input
                                                value={range.name}
                                                onChange={(e) =>
                                                    ctx.updateScoreRangeLabel(
                                                        sectionIndex,
                                                        index,
                                                        rangeIndex,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Score Label"
                                                className="border-0 p-1 h-auto max-w-[180px] focus-visible:ring-0 text-sm font-medium placeholder:text-gray-400"
                                            />
                                        </LabelWrapper>

                                        {criteria.criteria_score_ranges.length >
                                            1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() =>
                                                    ctx.removeScoreRange(
                                                        sectionIndex,
                                                        index,
                                                        rangeIndex
                                                    )
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-center mb-3 text-sm text-muted-foreground gap-x-1">
                                        <LabelWrapper
                                            label={null}
                                            error={getErrorMessageFromNestedPathValidationError(
                                                ctx.errors,
                                                [
                                                    'rubric_sections',
                                                    sectionIndex,
                                                    'rubric_criterias',
                                                    index,
                                                    'criteria_score_ranges',
                                                    rangeIndex,
                                                    'min_score',
                                                ]
                                            )}
                                            options={{
                                                error_display: 'tooltip',
                                            }}
                                        >
                                            <Input
                                                type="number"
                                                defaultValue={
                                                    range.min_score ?? ''
                                                }
                                                onBlur={(e) =>
                                                    ctx.updateScoreRangeMin(
                                                        sectionIndex,
                                                        index,
                                                        rangeIndex,
                                                        Number.parseInt(
                                                            e.target.value || ''
                                                        )
                                                    )
                                                }
                                                min={0}
                                                max={1000}
                                                maxLength={4}
                                                className="p-0 h-auto focus-visible:ring-0 text-center w-12 text-sm hide-arrows"
                                            />
                                        </LabelWrapper>
                                        -
                                        <LabelWrapper
                                            label={null}
                                            error={getErrorMessageFromNestedPathValidationError(
                                                ctx.errors,
                                                [
                                                    'rubric_sections',
                                                    sectionIndex,
                                                    'rubric_criterias',
                                                    index,
                                                    'criteria_score_ranges',
                                                    rangeIndex,
                                                    'max_score',
                                                ]
                                            )}
                                            options={{
                                                error_display: 'tooltip',
                                            }}
                                        >
                                            <Input
                                                type="number"
                                                defaultValue={
                                                    range.max_score ?? ''
                                                }
                                                onBlur={(e) =>
                                                    ctx.updateScoreRangeMax(
                                                        sectionIndex,
                                                        index,
                                                        rangeIndex,
                                                        Number.parseInt(
                                                            e.target.value || ''
                                                        )
                                                    )
                                                }
                                                min={0}
                                                max={1000}
                                                maxLength={4}
                                                className="p-0 h-auto focus-visible:ring-0 text-center w-12 text-sm hide-arrows"
                                            />
                                        </LabelWrapper>
                                        <span className="ml-1">points</span>
                                    </div>

                                    <LabelWrapper
                                        label={null}
                                        error={getErrorMessageFromNestedPathValidationError(
                                            ctx.errors,
                                            [
                                                'rubric_sections',
                                                sectionIndex,
                                                'rubric_criterias',
                                                index,
                                                'criteria_score_ranges',
                                                rangeIndex,
                                                'description',
                                            ]
                                        )}
                                        options={{
                                            error_display: 'tooltip',
                                        }}
                                    >
                                        <Textarea
                                            placeholder="Description (optional)"
                                            value={range.description}
                                            onChange={(e) =>
                                                ctx.updateScoreRangeDescription(
                                                    sectionIndex,
                                                    index,
                                                    rangeIndex,
                                                    e.target.value || ''
                                                )
                                            }
                                            maxLength={255}
                                            className="min-h-[80px] field-sizing-fixed resize-none text-sm"
                                        />
                                    </LabelWrapper>
                                </div>
                            )
                        )}
                        <div className="flex flex-col justify-center">
                            <Button
                                variant="outline"
                                className="h-full py-2 px-2 flex flex-col items-center justify-center gap-1 rounded-none"
                                onClick={() =>
                                    ctx.addScoreRange(sectionIndex, index)
                                }
                            >
                                <span className="text-xs [writing-mode:vertical-rl] rotate-180">
                                    ADD
                                </span>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function EditSectionDialog({
    section,
    onClose,
    onSubmit,
}: {
    section: Prettify<
        Pick<Section, 'name' | 'score_percentage' | 'description'> & {
            index: number
        }
    > | null
    onClose: () => void
    onSubmit: (
        index: number,
        name: string,
        score_percentage: number,
        description: string
    ) => void
}) {
    const nameRef = useRef<HTMLInputElement>(null)
    const scorePercentRef = useRef<HTMLInputElement>(null)
    const descriptionRef = useRef<HTMLTextAreaElement>(null)

    function handleSubmit() {
        if (!section || !nameRef.current || !scorePercentRef.current) return

        onSubmit(
            section.index,
            nameRef.current.value,
            Number(scorePercentRef.current.value),
            descriptionRef.current?.value || ''
        )
    }
    if (section === null) return null
    return (
        <Dialog
            open={section !== null}
            onOpenChange={(val) => {
                if (!val) onClose()
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Section</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-y-4">
                    <LabelWrapper
                        label={{
                            field: 'name',
                            text: 'Section Name',
                        }}
                    >
                        <Input defaultValue={section.name} ref={nameRef} />
                    </LabelWrapper>
                    <LabelWrapper
                        label={{
                            field: 'score_percentage',
                            text: 'Score Percentage',
                        }}
                        options={{
                            required: false,
                            label_placement: 'inline',
                        }}
                    >
                        <Input
                            defaultValue={section.score_percentage}
                            ref={scorePercentRef}
                            type="number"
                            className="hide-arrows w-auto max-w-[5rem] mr-2"
                        />
                        <span className="text-sm">%</span>
                    </LabelWrapper>
                    <LabelWrapper
                        label={{
                            field: 'description',
                            text: 'Description',
                        }}
                        options={{ required: false }}
                    >
                        <Textarea
                            defaultValue={section.description}
                            ref={descriptionRef}
                            className="min-h-[80px] field-sizing-fixed resize-none text-sm"
                            placeholder="Description (optional)"
                            maxLength={255}
                        />
                    </LabelWrapper>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
