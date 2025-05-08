'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import {
    createContext,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import QuillEditor from './quill-editor'

interface ScoreRange {
    label: string
    min: number
    max: number
    description: string
}

interface Criteria {
    name: string
    scoreRanges: ScoreRange[]
}

interface Section {
    name: string
    criteria: Criteria[]
    scoringType: 'individual' | 'group'
}

interface RubricBuilderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type RubricBuilderContextType = {
    sections: Section[]
    setSections: React.Dispatch<SetStateAction<Section[]>>
    addSection: () => void
    updateSectionName: (sectionIndex: number, name: string) => void
    removeSection: (sectionIndex: number) => void
    updateScoringType: (
        sectionIndex: number,
        scoringType: 'individual' | 'group'
    ) => void
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
    sections: [
        {
            name: 'Section 1',
            scoringType: 'group',
            criteria: [
                {
                    name: '',
                    scoreRanges: [
                        { label: '', min: 1, max: 5, description: '' },
                    ],
                },
            ],
        },
    ],
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
}: RubricBuilderDialogProps) {
    const [sections, setSections] = useState<Section[]>(
        rubricBuilderDefaultValue.sections
    )

    const addCriteria = (sectionIndex: number) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].criteria.push({
            name: 'New Criteria',
            scoreRanges: [
                { label: 'Good', min: 1, max: 7, description: '' },
                { label: 'Very Good', min: 6, max: 10, description: '' },
            ],
        })
        setSections(updatedSections)
    }

    useEffect(() => {
        console.log(sections)
    }, [sections])

    const updateCriteriaName = (
        sectionIndex: number,
        criteriaIndex: number,
        name: string
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].criteria[criteriaIndex].name = name
        setSections(updatedSections)
    }

    const removeCriteria = (sectionIndex: number, criteriaIndex: number) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].criteria.splice(criteriaIndex, 1)
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
        scoringType: 'individual' | 'group'
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].scoringType = scoringType
        setSections(updatedSections)
    }

    const updateScoreRangeLabel = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        label: string
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].criteria[criteriaIndex].scoreRanges[
            rangeIndex
        ].label = label
        setSections(updatedSections)
    }

    const updateScoreRangeDescription = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        description: string
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].criteria[criteriaIndex].scoreRanges[
            rangeIndex
        ].description = description
        setSections(updatedSections)
    }

    const updateScoreRangeMin = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        min: number
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].criteria[criteriaIndex].scoreRanges[
            rangeIndex
        ].min = min
        setSections(updatedSections)
    }

    const updateScoreRangeMax = (
        sectionIndex: number,
        criteriaIndex: number,
        rangeIndex: number,
        max: number
    ) => {
        const updatedSections = [...sections]
        updatedSections[sectionIndex].criteria[criteriaIndex].scoreRanges[
            rangeIndex
        ].max = max
        setSections(updatedSections)
    }

    const addScoreRange = (sectionIndex: number, criteriaIndex: number) => {
        const updatedSections = [...sections]
        const criteria = updatedSections[sectionIndex].criteria[criteriaIndex]
        const lastRange = criteria.scoreRanges[criteria.scoreRanges.length - 1]
        const diff = lastRange ? lastRange.max - lastRange.min : 0

        criteria.scoreRanges.push({
            label: '',
            min: lastRange ? lastRange.max + 1 : 1,
            max: lastRange ? lastRange.max + 1 + diff : 5,
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
        updatedSections[sectionIndex].criteria[
            criteriaIndex
        ].scoreRanges.splice(rangeIndex, 1)
        setSections(updatedSections)
    }

    const addSection = () => {
        setSections((prev) => [
            ...prev,
            {
                name: `Section ${prev.length + 1}`,
                scoringType: 'group',
                criteria: [
                    {
                        name: prev[prev.length - 1].criteria[0].name,
                        scoreRanges: [
                            {
                                label: prev[prev.length - 1].criteria[0]
                                    .scoreRanges[0].label,
                                min: prev[prev.length - 1].criteria[0]
                                    .scoreRanges[0].min,
                                max: prev[prev.length - 1].criteria[0]
                                    .scoreRanges[0].max,
                                description: '',
                            },
                        ],
                    },
                ],
            },
        ])
    }

    return (
        <RubricBuilderContext.Provider
            value={{
                sections,
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
                                section={section}
                            />
                        ))}

                        <Button
                            variant="outline"
                            className="w-full py-4 text-sm rounded-none"
                            onClick={addSection}
                        >
                            <Plus className="h-3 w-3 mr-2" /> ADD SECTION
                        </Button>

                        <div className="px-4 ">
                            <h3 className="text-sm font-medium mb-2">Note</h3>
                            <QuillEditor
                                // placeholder="Add any additional information about this rubric..."
                                className="min-h-[120px] w-full"
                            />
                        </div>
                        {/*  */}
                    </div>

                    <div className="border-t p-2 fixed bottom-0 left-0 right-0 bg-background z-10 flex items-center justify-end gap-x-4">
                        <Button variant="destructive">Cancel</Button>
                        <Button className=" ">Save Rubric</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </RubricBuilderContext.Provider>
    )
}

function RubricSection({
    section,
    index,
}: {
    section: Section
    index: number
}) {
    const [editingSectionName, setIsEditingSectionName] = useState(false)
    const sectionNameInputRef = useRef<HTMLInputElement>(null)
    const ctx = useContext(RubricBuilderContext)

    useEffect(() => {
        if (editingSectionName && sectionNameInputRef.current) {
            sectionNameInputRef.current.focus()
        }
    }, [editingSectionName, sectionNameInputRef.current])

    return (
        <div className="mb-8">
            <div className="flex">
                <div className="flex flex-col items-center justify-start p-3 rounded-none bg-paragon hover:bg-paragon-hover text-white hover:text-white cursor-pointer">
                    <div className="[writing-mode:vertical-rl] text-lg font-semibold flex-grow flex items-center justify-center gap-x-1">
                        {editingSectionName ? (
                            <Input
                                className="flex-grow border-0 p-0 text-center font-semibold bg-transparent text-sm rotate-180"
                                value={section.name}
                                onChange={(e) =>
                                    ctx.updateSectionName(index, e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsEditingSectionName(false)
                                    }
                                }}
                                ref={sectionNameInputRef}
                                onBlur={() => setIsEditingSectionName(false)}
                            />
                        ) : (
                            <>
                                {ctx.sections.length > 1 && (
                                    <Trash2
                                        className="inline-block -rotate-90 h-4 w-4"
                                        onClick={() => ctx.removeSection(index)}
                                    />
                                )}
                                <Pencil
                                    className="inline-block rotate-y-180 h-4 w-4"
                                    onClick={() =>
                                        setIsEditingSectionName(true)
                                    }
                                />
                                <p className="text-center font-semibold bg-transparent text-sm rotate-180">
                                    {section.name}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex-none pl-2 ">
                        <div className="flex items-center gap-2 mb-2 text-sm">
                            <span className="mr-2">Scoring Type:</span>
                            <div className="flex bg-white rounded-full  border">
                                <button
                                    className={cn(
                                        `px-2 py-1 rounded-full cursor-pointer`,
                                        section.scoringType === 'individual'
                                            ? 'bg-paragon text-white'
                                            : 'text-gray-700'
                                    )}
                                    onClick={() =>
                                        ctx.updateScoringType(
                                            index,
                                            'individual'
                                        )
                                    }
                                >
                                    Individual
                                </button>
                                <button
                                    className={cn(
                                        'px-2 py-1 rounded-full cursor-pointer',
                                        section.scoringType === 'group'
                                            ? 'bg-paragon text-white'
                                            : 'text-gray-700'
                                    )}
                                    onClick={() =>
                                        ctx.updateScoringType(index, 'group')
                                    }
                                >
                                    Group
                                </button>
                            </div>
                        </div>
                    </div>
                    {section.criteria.map((criteria, criteriaIndex) => (
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
                        {ctx.sections[sectionIndex].criteria.length > 1 && (
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
                        <Input
                            value={criteria.name}
                            onChange={(e) =>
                                ctx.updateCriteriaName(
                                    sectionIndex,
                                    index,
                                    e.target.value
                                )
                            }
                            className="text-sm font-medium w-48"
                            placeholder="Criteria name"
                        />
                    </div>

                    {/* Score range blocks */}
                    <div className="flex overflow-x-auto">
                        {criteria.scoreRanges.map((range, rangeIndex) => (
                            <div
                                key={rangeIndex}
                                className="border p-3 flex-shrink-0 relative"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Input
                                        value={range.label}
                                        onChange={(e) =>
                                            ctx.updateScoreRangeLabel(
                                                sectionIndex,
                                                index,
                                                rangeIndex,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Label"
                                        className="border-0 p-0 h-auto max-w-[180px] focus-visible:ring-0 text-sm font-medium"
                                    />

                                    {criteria.scoreRanges.length > 1 && (
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
                                    <Input
                                        type="number"
                                        value={range.min}
                                        onChange={(e) =>
                                            ctx.updateScoreRangeMin(
                                                sectionIndex,
                                                index,
                                                rangeIndex,
                                                Number.parseInt(e.target.value)
                                            )
                                        }
                                        className="p-0 h-auto focus-visible:ring-0 text-center w-12 text-sm hide-arrows"
                                    />
                                    -
                                    <Input
                                        type="number"
                                        value={range.max}
                                        onChange={(e) =>
                                            ctx.updateScoreRangeMax(
                                                sectionIndex,
                                                index,
                                                rangeIndex,
                                                Number.parseInt(e.target.value)
                                            )
                                        }
                                        className="p-0 h-auto focus-visible:ring-0 text-center w-12 text-sm hide-arrows"
                                    />
                                    <span className="ml-1">points</span>
                                </div>

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
                                    className="min-h-[80px] field-sizing-fixed resize-none text-sm"
                                />
                            </div>
                        ))}
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
