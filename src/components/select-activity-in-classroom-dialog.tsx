'use client'

import { getRubricsInClassroom } from '@/app/(with_navbar)/classroom/[id]/activities/new/actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
    Activity,
    Classroom,
    GetRubricInClassroomResponse,
    colorMap,
} from '@/types/classroom'
import { ArrowLeft, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

// Mock activity data
const mockActivities: Activity[] = [
    {
        id: 'activity-1',
        classroom_id: 'classroom-1',
        title: 'Midterm Exam',
        description:
            'Comprehensive assessment covering all topics from weeks 1-7',
        category_id: 'cat-1',
        grouping_id: null,
        rubric_id: 'rubric-1',
        scoring_type: 'rubric',
        max_score: 100,
        posted_by: 'user-1',
        files: [],
        hide_score: false,
        created_at: '2025-05-15T10:00:00Z',
        updated_at: '2025-05-15T10:00:00Z',
    },
    {
        id: 'activity-2',
        classroom_id: 'classroom-1',
        title: 'Group Project: Data Analysis',
        description: 'Analyze the provided dataset and present your findings',
        category_id: 'cat-2',
        grouping_id: 'group-1',
        rubric_id: 'rubric-2',
        scoring_type: 'rubric',
        max_score: 50,
        posted_by: 'user-1',
        files: [],
        hide_score: false,
        created_at: '2025-05-20T14:30:00Z',
        updated_at: '2025-05-20T14:30:00Z',
    },

    {
        id: 'activity-3',
        classroom_id: 'classroom-2',
        title: 'Final Project Rubric',
        description: 'Evaluation criteria for the final project submission',
        category_id: 'cat-3',
        grouping_id: null,
        rubric_id: 'rubric-3',
        scoring_type: 'rubric',
        max_score: 100,
        posted_by: 'user-2',
        files: [],
        hide_score: false,
        created_at: '2025-06-01T09:15:00Z',
        updated_at: '2025-06-01T09:15:00Z',
    },
    {
        id: 'activity-4',
        classroom_id: 'classroom-2',
        title: 'Oral Presentation Assessment',
        description: 'Rubric for evaluating student presentations',
        category_id: 'cat-4',
        grouping_id: null,
        rubric_id: 'rubric-4',
        scoring_type: 'rubric',
        max_score: 30,
        posted_by: 'user-2',
        files: [],
        hide_score: false,
        created_at: '2025-06-05T13:45:00Z',
        updated_at: '2025-06-05T13:45:00Z',
    },

    {
        id: 'activity-5',
        classroom_id: 'classroom-3',
        title: 'Research Paper Evaluation',
        description: 'Detailed criteria for assessing research papers',
        category_id: 'cat-5',
        grouping_id: null,
        rubric_id: 'rubric-5',
        scoring_type: 'rubric',
        max_score: 80,
        posted_by: 'user-3',
        files: [],
        hide_score: false,
        created_at: '2025-06-10T11:20:00Z',
        updated_at: '2025-06-10T11:20:00Z',
    },
]

interface SelectActivityInClassroomProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    classrooms: Classroom[]
    onSelect: (rubric: GetRubricInClassroomResponse) => void
}

export function SelectActivityInClassroomDialog({
    open,
    onOpenChange,
    classrooms,
    onSelect,
}: SelectActivityInClassroomProps) {
    const [view, setView] = useState<'classrooms' | 'activities'>('classrooms')
    const [selectedClassroom, setSelectedClassroom] =
        useState<Classroom | null>(null)
    const [selectedRubric, setSelectedRubric] =
        useState<GetRubricInClassroomResponse | null>(null)
    const [rubrics, setRubrics] = useState<GetRubricInClassroomResponse[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Filter classrooms based on search query
    const filteredClassrooms = classrooms.filter((classroom) =>
        classroom.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter activities based on search query
    const filteredRubrics = rubrics.filter((rubrics) =>
        rubrics.activity_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Handle classroom selection
    const handleClassroomSelect = async (classroom: Classroom) => {
        setSelectedClassroom(classroom)
        setSearchQuery('')
        setError(null)
        setIsLoading(true)

        const fetchedRubrics = await getRubricsInClassroom(classroom.id)
        setRubrics(fetchedRubrics)

        setIsLoading(false)
        setView('activities')
    }

    // Handle activity selection
    const handleActivitySelect = (rubric: GetRubricInClassroomResponse) => {
        setSelectedRubric(rubric)
    }

    // Handle confirm selection
    const handleConfirmSelection = () => {
        if (selectedRubric) {
            onSelect(selectedRubric)
            resetState()
            onOpenChange(false)
        }
    }

    // Handle going back to classroom selection
    const handleBack = () => {
        setView('classrooms')
        setSelectedRubric(null)
        setSearchQuery('')
        setError(null)
    }

    // Reset all state
    const resetState = () => {
        setSelectedRubric(null)
        setSelectedClassroom(null)
        setView('classrooms')
        setSearchQuery('')
        setError(null)
    }

    // Reset state when dialog is closed
    useEffect(() => {
        if (!open) {
            resetState()
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] h-[90dvh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {view === 'classrooms'
                            ? 'Import Rubric'
                            : `Select an Activity from ${selectedClassroom?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`Search ${view === 'classrooms' ? 'classrooms' : 'activities'}...`}
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {/* Main content area with fixed height to ensure consistency */}
                <div className="flex-1 overflow-hidden flex flex-col h-[350px]">
                    {view === 'classrooms' ? (
                        <>
                            <div className="flex-1 overflow-y-auto pr-1">
                                {filteredClassrooms.length > 0 ? (
                                    filteredClassrooms.map((classroom) => (
                                        <div
                                            key={classroom.id}
                                            className={cn(
                                                'p-4 border rounded-md mb-2 cursor-pointer hover:bg-muted transition-colors',
                                                selectedClassroom?.id ===
                                                    classroom.id &&
                                                    'bg-muted border-primary'
                                            )}
                                            onClick={() =>
                                                setSelectedClassroom(classroom)
                                            }
                                            onDoubleClick={() =>
                                                handleClassroomSelect(classroom)
                                            }
                                            tabIndex={0}
                                            role="button"
                                            aria-selected={
                                                selectedClassroom?.id ===
                                                classroom.id
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        'w-3 h-3 rounded-full',
                                                        classroom.color &&
                                                            colorMap[
                                                                classroom.color
                                                            ]
                                                    )}
                                                />
                                                <h3 className="font-medium">
                                                    {classroom.name}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Double-click to view activities
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        {classrooms.length === 0
                                            ? 'No classrooms available'
                                            : 'No classrooms match your search'}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto pr-1">
                                {isLoading ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        Loading activities...
                                    </p>
                                ) : filteredRubrics.length > 0 ? (
                                    filteredRubrics.map((rubric) => (
                                        <div
                                            key={rubric.id}
                                            className={cn(
                                                'p-4 border rounded-md mb-2 cursor-pointer hover:bg-muted transition-colors',
                                                selectedRubric?.id ===
                                                    rubric.id &&
                                                    'bg-muted border-primary'
                                            )}
                                            onClick={() =>
                                                handleActivitySelect(rubric)
                                            }
                                            onDoubleClick={() =>
                                                handleConfirmSelection()
                                            }
                                            tabIndex={0}
                                            role="button"
                                            aria-selected={
                                                selectedRubric?.id === rubric.id
                                            }
                                        >
                                            <h3 className="font-medium">
                                                {rubric.activity_name}
                                            </h3>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        {rubrics.length === 0
                                            ? 'No activities found in this classroom'
                                            : 'No activities match your search'}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="w-full mt-4 flex items-center">
                    {view === 'activities' && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="mr-auto"
                        >
                            <ArrowLeft />
                            Back
                        </Button>
                    )}
                    <div className="flex items-center gap-x-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        {view === 'activities' && (
                            <Button
                                onClick={handleConfirmSelection}
                                disabled={!selectedRubric}
                            >
                                Select
                            </Button>
                        )}
                        {view === 'classrooms' && selectedClassroom && (
                            <Button
                                onClick={() =>
                                    handleClassroomSelect(selectedClassroom)
                                }
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
