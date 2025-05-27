'use client'

import ConditionalTooltip from '@/components/conditional-tooltip'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDecimalNumber } from '@/lib/utils'
import { UserEssentialDetail } from '@/types/auth'
import {
    CLASSROOM_ROLE_TEACHER,
    GetActivity,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
} from '@/types/classroom'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../../classroom/[id]/actions'
import {
    assignJudgesToStudent,
    getRangeScoreDetail,
    getRubricScoreDetail,
} from './actions'
import { ListUser } from './activity-groups'
import AssignJudgeAll from './assign-judge-all'
import { AssignJudgeButton } from './assign-judge-button'
import { AssignJudgeDialog } from './assign-jugde-dialog'
import { GiveScoreButton } from './give-score-button'
import { ScoreData } from './score/score-activity'
import ViewScoreDetailDialog from './view-score-detail-dialog'

export default function ActivityStudents({
    activity,
    judges,
    classroom,
}: {
    activity: GetActivity
    judges: UserEssentialDetail[]
    classroom: GetClassroomResponse
}) {
    const [studentToAssignJudges, setStudentToAssignJudges] = useState<
        NonNullable<typeof activity.students>[number] | null
    >(null)
    const [openStudents, setOpenStudents] = useState<string[]>([])
    const searchParams = useSearchParams()
    const router = useRouter()
    const [studentToHighlight, setStudentToHighlight] = useState<string | null>(
        null
    )
    const pathname = usePathname()
    const [studentToViewScoreDetail, setStudentToViewScoreDetail] = useState<
        NonNullable<typeof activity.students>[number] | null
    >(null)
    const [scores, setScores] = useState<
        {
            judge: UserEssentialDetail
            comment: string
            data: ScoreData['range_based_scores'] | ScoreData['rubric_score']
        }[]
    >([])

    function toggleStudent(studentId: string) {
        setOpenStudents((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        )
    }

    useEffect(() => {
        async function fetchData() {
            if (!studentToViewScoreDetail) return
            if (activity.scoring_type == SCORING_TYPE_RUBRIC) {
                const response = await getRubricScoreDetail(
                    studentToViewScoreDetail.activity_assignment_id
                )

                if (response.success) {
                    setScores(response.data!)
                } else {
                    setStudentToViewScoreDetail(null)
                    toast.error(response.message)
                }
            } else if (activity.scoring_type == SCORING_TYPE_RANGE) {
                const response = await getRangeScoreDetail(
                    studentToViewScoreDetail.activity_assignment_id
                )

                if (response.success) {
                    setScores(response.data!)
                } else {
                    setStudentToViewScoreDetail(null)
                    toast.error(response.message)
                }
            }
        }
        fetchData()
    }, [studentToViewScoreDetail])

    useEffect(() => {
        if (searchParams.get('sid')) {
            const studentId = searchParams.get('sid')
            if (studentId && activity.students) {
                const student = activity.students.find(
                    (s) => s.id === studentId
                )
                if (student) {
                    toggleStudent(studentId)
                    setStudentToHighlight(studentId)
                }
            }
            setTimeout(() => router.replace(pathname), 3000)
        } else {
            setStudentToHighlight(null)
        }
    }, [searchParams])

    async function handleAssignJudges(judgesId: string[]) {
        if (!studentToAssignJudges) return

        const response = await assignJudgesToStudent(
            activity.id,
            studentToAssignJudges.id,
            judgesId
        )

        if (response.success) {
            toast.success(response.message)
            setStudentToAssignJudges(null)
        } else {
            toast.error(response.message)
        }
    }

    return (
        // <ScrollArea className="h-[calc(100vh-5rem)]">
        <ScrollArea>
            <div>
                <div className="mb-4">
                    <AssignJudgeAll activityID={activity.id} judges={judges} />
                </div>
                <div className="border rounded-lg bg-card divide-y divide-border">
                    {activity.students?.map((student) => (
                        <ListStudentWithJudges
                            highlight={
                                studentToHighlight !== null &&
                                studentToHighlight === student.id
                            }
                            classroom={classroom}
                            activity={activity}
                            open={openStudents.includes(student.id)}
                            onOpenChange={() => toggleStudent(student.id)}
                            student={student}
                            key={student.id}
                            onAssign={() => setStudentToAssignJudges(student)}
                            onViewScoreDetail={() =>
                                setStudentToViewScoreDetail(student)
                            }
                        />
                    ))}
                </div>
            </div>
            <AssignJudgeDialog
                open={!!studentToAssignJudges}
                onClose={() => setStudentToAssignJudges(null)}
                judges={judges}
                selectedJudges={
                    studentToAssignJudges ? studentToAssignJudges.judges : []
                }
                onAssignJudges={handleAssignJudges}
            />
            <ViewScoreDetailDialog
                open={!!studentToViewScoreDetail}
                onOpenChange={(val) => {
                    if (!val) setStudentToViewScoreDetail(null)
                }}
                scores={scores}
                scoringEntity={
                    studentToViewScoreDetail !== null
                        ? {
                              isScored: true,
                              type: 'individual',
                              activity_assignment_id:
                                  studentToViewScoreDetail.activity_assignment_id,
                              entity: studentToViewScoreDetail,
                          }
                        : null
                }
                activity={activity}
            />
        </ScrollArea>
    )
}
function ListStudentWithJudges({
    highlight,
    classroom,
    activity,
    student,
    open,
    onOpenChange,
    onAssign,
    onViewScoreDetail,
}: {
    highlight: boolean
    classroom: GetClassroomResponse
    activity: GetActivity
    student: NonNullable<GetActivity['students']>[number]
    open: boolean
    onOpenChange: () => void
    onAssign: () => void
    onViewScoreDetail: () => void
}) {
    return (
        <Collapsible
            key={student.id}
            open={open}
            onOpenChange={(val) => {
                if (val && student.judges.length === 0) return
                onOpenChange()
            }}
            className="border rounded-lg bg-card"
        >
            <CollapsibleTrigger className="w-full">
                <div
                    className={cn(
                        'px-4 py-3 border-b bg-muted/40 flex items-center gapx-x-2 hover:bg-muted/60 transition-colors cursor-pointer gap-x-2',
                        highlight &&
                            'border border-paragon relative animate-border-pulse'
                    )}
                >
                    <div className="relative h-8 w-8 shrink-0 flex items-center gap-2 px-2">
                        <Image
                            src={student.profile_picture}
                            alt={`${student.first_name} ${student.last_name}`}
                            fill
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0 text-start ml-2">
                        <p className="text-sm font-medium truncate">
                            {student.first_name} {student.last_name}
                        </p>
                        <p className="h-5 px-0 text-xs text-muted-foreground justify-start font-normal truncate max-w-full">
                            {student.email}
                        </p>
                    </div>

                    <div className="ml-auto flex items-center gap-x-2">
                        {activity.rubric_id !== null ? (
                            student.score_percentage !== null && (
                                <ConditionalTooltip
                                    text="See detail"
                                    show={
                                        classroom.role == CLASSROOM_ROLE_TEACHER
                                    }
                                >
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            classroom.role ==
                                                CLASSROOM_ROLE_TEACHER &&
                                                'hover:border-black'
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onViewScoreDetail()
                                        }}
                                    >
                                        {formatDecimalNumber(
                                            student.score_percentage
                                        )}
                                        /100
                                    </Badge>
                                </ConditionalTooltip>
                            )
                        ) : student.score !== null ? (
                            <ConditionalTooltip
                                text="See detail"
                                show={classroom.role == CLASSROOM_ROLE_TEACHER}
                            >
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        classroom.role ==
                                            CLASSROOM_ROLE_TEACHER &&
                                            'hover:border-black'
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onViewScoreDetail()
                                    }}
                                >
                                    {formatDecimalNumber(student.score)}/
                                    {activity.max_score}
                                </Badge>
                            </ConditionalTooltip>
                        ) : student.score_percentage !== null ? (
                            <ConditionalTooltip
                                text="See detail"
                                show={classroom.role == CLASSROOM_ROLE_TEACHER}
                            >
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        classroom.role ==
                                            CLASSROOM_ROLE_TEACHER &&
                                            'hover:border-black'
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onViewScoreDetail()
                                    }}
                                >
                                    {formatDecimalNumber(
                                        student.score_percentage
                                    )}
                                    /100
                                </Badge>
                            </ConditionalTooltip>
                        ) : null}

                        <AssignJudgeButton onClick={onAssign} />
                        {student.permitted_to_judge && (
                            <GiveScoreButton
                                activityId={activity.id}
                                studentId={student.id}
                            />
                        )}

                        <ChevronDown
                            className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                open && 'transform rotate-180',
                                student.judges.length === 0 && 'opacity-0'
                            )}
                        />
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="divide-y divide-border">
                {student.judges.map((judge) => (
                    <ListUser user={judge} isJudge key={judge.id} />
                ))}
            </CollapsibleContent>
        </Collapsible>
    )
}
