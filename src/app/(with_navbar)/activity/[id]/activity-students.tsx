'use client'

import CoonditionalTooltip from '@/components/conditional-tooltip'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDecimalNumber } from '@/lib/utils'
import { UserEssentialDetail } from '@/types/auth'
import { GetActivity } from '@/types/classroom'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { assignJudgesToStudent } from './actions'
import { ListUser } from './activity-groups'
import AssignJudgeAll from './assign-judge-all'
import { AssignJudgeButton } from './assign-judge-button'
import { AssignJudgeDialog } from './assign-jugde-dialog'
import { GiveScoreButton } from './give-score-button'

export default function ActivityStudents({
    activity,
    judges,
}: {
    activity: GetActivity
    judges: UserEssentialDetail[]
}) {
    const [studentToAssignJudges, setStudentToAssignJudges] = useState<
        NonNullable<typeof activity.students>[number] | null
    >(null)
    const [openStudents, setOpenStudents] = useState<string[]>([])

    function toggleGroup(studentId: string) {
        setOpenStudents((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        )
    }

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
                            activity={activity}
                            open={openStudents.includes(student.id)}
                            onOpenChange={() => toggleGroup(student.id)}
                            student={student}
                            key={student.id}
                            onAssign={() => setStudentToAssignJudges(student)}
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
        </ScrollArea>
    )
}
function ListStudentWithJudges({
    activity,
    student,
    open,
    onOpenChange,
    onAssign,
}: {
    activity: GetActivity
    student: NonNullable<GetActivity['students']>[number]
    open: boolean
    onOpenChange: () => void
    onAssign: () => void
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
                <div className="px-4 py-3 border-b bg-muted/40 flex items-center gapx-x-2 hover:bg-muted/60 transition-colors cursor-pointer gap-x-2">
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
                                <CoonditionalTooltip
                                    text="See detail"
                                    show={true}
                                >
                                    <Badge variant="outline">
                                        {formatDecimalNumber(
                                            student.score_percentage
                                        )}
                                        /100
                                    </Badge>
                                </CoonditionalTooltip>
                            )
                        ) : student.score !== null ? (
                            <Badge variant="outline">
                                {formatDecimalNumber(student.score)}/
                                {activity.max_score}
                            </Badge>
                        ) : student.score_percentage !== null ? (
                            <Badge variant="outline">
                                {formatDecimalNumber(student.score_percentage)}
                                /100
                            </Badge>
                        ) : null}

                        <AssignJudgeButton onClick={onAssign} />
                        {student.permitted_to_judge && (
                            <GiveScoreButton activityId={activity.id} />
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
