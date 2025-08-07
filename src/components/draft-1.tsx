'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
    Classroom,
    GetRubricInClassroomResponse,
    colorMap,
} from '@/types/classroom'
import { ArrowLeft, Check, Loader2, School } from 'lucide-react'
import { useState } from 'react'

interface SelectActivityInClassroomProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    classrooms: Classroom[]
    onSelect: (rubricId: string) => void
}

export function SelectActivityInClassroom({
    open,
    onOpenChange,
    classrooms,
    onSelect,
}: SelectActivityInClassroomProps) {
    const [step, setStep] = useState<'classroom' | 'activity'>('classroom')
    const [selectedClassroom, setSelectedClassroom] =
        useState<Classroom | null>(null)
    const [selectedActivity, setSelectedActivity] =
        useState<GetRubricInClassroomResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [activities, setActivities] = useState<
        GetRubricInClassroomResponse[]
    >([])

    const handleClassroomSelect = async (classroom: Classroom) => {
        setIsLoading(true)
        setSelectedClassroom(classroom)

        try {
            // Mock fetch - replace with your actual API call
            // const response = await fetch(`/api/classrooms/${classroom.id}/activities`);
            // const data = await response.json();
            // setActivities(data);

            // Mock data for demonstration
            setTimeout(() => {
                setActivities([
                    {
                        id: '1',
                        activity_name: 'Midterm Exam',
                        has_weightage: true,
                        max_score: 100,
                        note: 'This is the midterm exam rubric',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        rubric_sections: [
                            {
                                id: 's1',
                                rubric_id: '1',
                                name: 'Section 1',
                                description: 'First section',
                                is_group_score: false,
                                score_percentage: 100,
                                max_score: 100,
                                order: 1,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                rubric_criterias: [
                                    {
                                        id: 'c1',
                                        rubric_section_id: 's1',
                                        name: 'Criteria 1',
                                        min_score: 0,
                                        max_score: 100,
                                        order: 1,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                        criteria_score_ranges: [
                                            {
                                                id: 'sr1',
                                                rubric_criteria_id: 'c1',
                                                name: 'Score Range 1',
                                                description:
                                                    'First score range',
                                                min_score: 0,
                                                max_score: 100,
                                                created_at:
                                                    new Date().toISOString(),
                                                updated_at:
                                                    new Date().toISOString(),
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: '2',
                        activity_name: 'Final Project',
                        has_weightage: true,
                        max_score: 100,
                        note: 'This is the final project rubric',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        rubric_sections: [
                            {
                                id: 's2',
                                rubric_id: '2',
                                name: 'Section 1',
                                description: 'First section',
                                is_group_score: true,
                                score_percentage: 100,
                                max_score: 100,
                                order: 1,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                rubric_criterias: [
                                    {
                                        id: 'c2',
                                        rubric_section_id: 's2',
                                        name: 'Criteria 1',
                                        min_score: 0,
                                        max_score: 100,
                                        order: 1,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                        criteria_score_ranges: [
                                            {
                                                id: 'sr2',
                                                rubric_criteria_id: 'c2',
                                                name: 'Score Range 1',
                                                description:
                                                    'First score range',
                                                min_score: 0,
                                                max_score: 100,
                                                created_at:
                                                    new Date().toISOString(),
                                                updated_at:
                                                    new Date().toISOString(),
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: '3',
                        activity_name: 'Quiz 1',
                        has_weightage: false,
                        max_score: 50,
                        note: 'This is quiz 1 rubric',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        rubric_sections: [
                            {
                                id: 's3',
                                rubric_id: '3',
                                name: 'Section 1',
                                description: 'First section',
                                is_group_score: false,
                                score_percentage: 100,
                                max_score: 50,
                                order: 1,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                rubric_criterias: [
                                    {
                                        id: 'c3',
                                        rubric_section_id: 's3',
                                        name: 'Criteria 1',
                                        min_score: 0,
                                        max_score: 50,
                                        order: 1,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                        criteria_score_ranges: [
                                            {
                                                id: 'sr3',
                                                rubric_criteria_id: 'c3',
                                                name: 'Score Range 1',
                                                description:
                                                    'First score range',
                                                min_score: 0,
                                                max_score: 50,
                                                created_at:
                                                    new Date().toISOString(),
                                                updated_at:
                                                    new Date().toISOString(),
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ])
                setIsLoading(false)
                setStep('activity')
            }, 500)
        } catch (error) {
            console.error('Failed to fetch activities', error)
            setIsLoading(false)
        }
    }

    const handleActivitySelect = (activity: GetRubricInClassroomResponse) => {
        setSelectedActivity(activity)
    }

    const handleSelectConfirm = () => {
        if (selectedActivity) {
            onSelect(selectedActivity.id)
            resetState()
        }
    }

    const handleBack = () => {
        setStep('classroom')
        setSelectedActivity(null)
    }

    const resetState = () => {
        setStep('classroom')
        setSelectedClassroom(null)
        setSelectedActivity(null)
        setActivities([])
    }

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            resetState()
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {step === 'activity' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="h-6 w-6 mr-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        {step === 'classroom'
                            ? 'Import Rubric'
                            : `Select Activity from ${selectedClassroom?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden my-2">
                    {isLoading ? (
                        <div className="h-[50vh] flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="h-[50vh] overflow-y-auto pr-1">
                            {step === 'classroom' ? (
                                <>
                                    {classrooms.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                            <School className="h-10 w-10 mb-2" />
                                            <p>No classrooms available</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 p-1">
                                            {classrooms.map((classroom) => (
                                                <Card
                                                    key={classroom.id}
                                                    className={cn(
                                                        'cursor-pointer transition-all hover:bg-muted/50',
                                                        selectedClassroom?.id ===
                                                            classroom.id &&
                                                            'border-primary'
                                                    )}
                                                    onClick={() =>
                                                        handleClassroomSelect(
                                                            classroom
                                                        )
                                                    }
                                                    onDoubleClick={() =>
                                                        handleClassroomSelect(
                                                            classroom
                                                        )
                                                    }
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={cn(
                                                                    'w-3 h-3 rounded-full',
                                                                    classroom.color &&
                                                                        colorMap[
                                                                            classroom
                                                                                .color
                                                                        ]
                                                                )}
                                                            />

                                                            <div className="flex-1">
                                                                <h3 className="font-medium">
                                                                    {
                                                                        classroom.name
                                                                    }
                                                                </h3>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {activities.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                            <p>
                                                No activities found in this
                                                classroom
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2 p-1">
                                            {activities.map((activity) => (
                                                <Card
                                                    key={activity.id}
                                                    className={cn(
                                                        'cursor-pointer transition-all hover:bg-muted/50',
                                                        selectedActivity?.id ===
                                                            activity.id &&
                                                            'border-primary bg-muted/50'
                                                    )}
                                                    onClick={() =>
                                                        handleActivitySelect(
                                                            activity
                                                        )
                                                    }
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium">
                                                                {
                                                                    activity.activity_name
                                                                }
                                                            </p>
                                                            {selectedActivity?.id ===
                                                                activity.id && (
                                                                <Check className="h-4 w-4 text-primary" />
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={() => handleDialogClose(false)}
                    >
                        Cancel
                    </Button>

                    {step === 'activity' && (
                        <Button
                            onClick={handleSelectConfirm}
                            disabled={!selectedActivity}
                        >
                            Select
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
