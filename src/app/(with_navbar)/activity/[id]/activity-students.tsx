'use client'

import ConditionalTooltip from '@/components/conditional-tooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TextFileWriter } from '@/lib/text-file-writer'
import { cn, formatDecimalNumber, generateFileNameForExport } from '@/lib/utils'
import { UserEssentialDetail } from '@/types/auth'
import {
    CLASSROOM_ROLE_TEACHER,
    GetActivity,
    GetRubric,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
} from '@/types/classroom'
import { Prettify } from '@/types/general'
import { ChevronDown, FileDown, FileSpreadsheet, FileText } from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../../classroom/[id]/actions'
import {
    assignJudgesToStudent,
    getRangeScoreDetail,
    GetRangeScoreFromAJudge,
    getRubricScoreDetail,
    GetRubricScoreFromJudge,
    getScoresOfActivity,
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

    async function exportData(
        fileType: 'csv' | 'xlsx',
        mode: 'detailed' | 'final'
    ) {
        if (activity.scoring_type === null) return

        if (
            activity.scoring_type !== 'range' &&
            activity.scoring_type !== 'rubric'
        ) {
            throw new Error('scoring type not supported')
        }

        if (mode == 'detailed') {
            const response = await getScoresOfActivity(
                activity.id,
                activity.scoring_type
            )

            if (!response.success) {
                toast.error(response.message)
                return
            }

            const data = formatDetailedScore(
                activity.scoring_type,
                response.data!
            )

            const textFileWriter = new TextFileWriter(
                data,
                fileType,
                generateFileNameForExport(activity.title + ' grades')
            )

            textFileWriter.write()
            textFileWriter.download()
        } else {
            const data = formatFinalScore(activity.scoring_type)
            const textFileWriter = new TextFileWriter(
                data,
                fileType,
                generateFileNameForExport(activity.title + ' grades')
            )

            textFileWriter.write()
            textFileWriter.download()
        }
    }

    function formatDetailedScore(
        scoringType: 'rubric' | 'range',
        data: Prettify<
            NonNullable<Awaited<ReturnType<typeof getScoresOfActivity>>['data']>
        >
    ) {
        const allStudents = classroom.people.students
        const students = allStudents.filter((s) => s.first_name)

        if (!activity.students) {
            toast.error(
                'Failed to get data to export. Please refresh and try again'
            )
            throw new Error(
                'Failed to get data to export. Please refresh and try again'
            )
        }

        let result = []

        if (scoringType == 'rubric') {
            if (activity.rubric_id == null || !activity.rubric) {
                toast.error(
                    'Failed to get data to export. Please refresh and try again'
                )
                throw new Error(
                    'Failed to get data to export. Please refresh and try again'
                )
            }

            const sections = activity.rubric.rubric_sections

            for (const student of students) {
                const initalData: Record<string, any> = {
                    'Student ID': student.id,
                    'Student Name': `${student.first_name} ${student.last_name}`,
                    Email: student.email,
                }

                let judges: UserEssentialDetail[] = []
                if (activity.grouping_id != null && activity.groups) {
                    const group = activity.groups.find((g) =>
                        g.users.find((u) => u.id == student.id)
                    )

                    judges = group ? group.judges : []
                } else {
                    judges =
                        activity.students.find((s) => s.id == student.id)
                            ?.judges ?? []
                }

                const tmp = data.find((d) => d.student.id == student.id)
                const scores = tmp
                    ? (tmp.score_data as GetRubricScoreFromJudge[])
                    : []

                // since there will always at least one row, we will set the one row outside the loop
                const firstRowData: Record<string, any> = {
                    ...initalData,
                    'Judge Name': judges
                        ? `${judges[0].first_name} ${judges[0].last_name}`
                        : '',
                    'Judge Email': judges ? judges[0].email : '',
                    ...generateRubricScoreRow(
                        sections,
                        scores.find((s) => s.judge.id == judges[0].id)
                            ?.scores ?? []
                    ),
                }

                result.push(firstRowData)

                for (let i = 1; i < judges.length; i++) {
                    const _data: Record<string, any> = {
                        ...initalData,
                        'Judge Name': judges
                            ? `${judges[i].first_name} ${judges[i].last_name}`
                            : '',
                        'Judge Email': judges ? judges[i].email : '',
                        ...generateRubricScoreRow(
                            sections,
                            scores.find((s) => s.judge.id == judges[i].id)
                                ?.scores ?? []
                        ),
                    }

                    result.push(_data)
                }
            }
        } else {
            if (!activity.max_score) {
                toast.error(
                    'Failed to get data to export. Please refresh and try again'
                )
                throw new Error(
                    'Failed to get data to export. Please refresh and try again'
                )
            }

            for (const student of students) {
                const initalData: Record<string, any> = {
                    'Student ID': student.id,
                    'Student Name': `${student.first_name} ${student.last_name}`,
                    Email: student.email,
                }

                let judges: UserEssentialDetail[] = []
                if (activity.grouping_id != null && activity.groups) {
                    const group = activity.groups.find((g) =>
                        g.users.find((u) => u.id == student.id)
                    )

                    judges = group ? group.judges : []
                } else {
                    judges =
                        activity.students.find((s) => s.id == student.id)
                            ?.judges ?? []
                }

                const tmp = data.find((d) => d.student.id == student.id)
                const scores = tmp
                    ? (tmp.score_data as GetRangeScoreFromAJudge[])
                    : []

                // since there will always at least one row, we will set the one row outside the loop
                const firstRowData: Record<string, any> = {
                    ...initalData,
                    'Judge Name': judges
                        ? `${judges[0].first_name} ${judges[0].last_name}`
                        : '',
                    'Judge Email': judges ? judges[0].email : '',
                    'Given Score': judges
                        ? (scores.find((s) => s.judge.id == judges[0].id)
                              ?.score ?? '')
                        : '',
                    'Max Score': activity.max_score,
                }

                result.push(firstRowData)

                for (let i = 1; i < judges.length; i++) {
                    const _data: Record<string, any> = {
                        ...initalData,
                        'Judge Name': judges
                            ? `${judges[i].first_name} ${judges[i].last_name}`
                            : '',
                        'Judge Email': judges ? judges[i].email : '',
                        'Given Score': judges
                            ? (scores.find((s) => s.judge.id == judges[i].id)
                                  ?.score ?? '')
                            : '',
                        'Max Score': activity.max_score,
                    }

                    result.push(_data)
                }
            }
        }
        return result
    }

    function formatFinalScore(scoringType: 'rubric' | 'range') {
        const allStudents = classroom.people.students
        const students = allStudents.filter((s) => s.first_name)

        if (!activity.students) {
            toast.error(
                'Failed to get data to export. Please refresh and try again'
            )
            throw new Error(
                'Failed to get data to export. Please refresh and try again'
            )
        }

        let data = []

        if (scoringType == 'rubric') {
            if (activity.rubric_id == null || !activity.rubric) {
                toast.error(
                    'Failed to get data to export. Please refresh and try again'
                )
                throw new Error(
                    'Failed to get data to export. Please refresh and try again'
                )
            }

            for (const student of students) {
                let judges: UserEssentialDetail[] = []
                if (activity.grouping_id != null && activity.groups) {
                    const group = activity.groups.find((g) =>
                        g.users.find((u) => u.id == student.id)
                    )

                    judges = group ? group.judges : []
                } else {
                    judges =
                        activity.students.find((s) => s.id == student.id)
                            ?.judges ?? []
                }

                let scorePercentage: number | string = ''

                if (activity.grouping_id != null && activity.groups) {
                    const tmp = activity.groups
                        .flatMap((g) => g.users)
                        .find((u) => u.id == student.id)

                    scorePercentage =
                        tmp && tmp.score_percentage !== null
                            ? tmp.score_percentage
                            : ''
                } else {
                    const tmp = activity.students.find(
                        (s) => s.id == student.id
                    )

                    scorePercentage =
                        tmp && tmp.score_percentage !== null
                            ? tmp.score_percentage
                            : ''
                }

                const rowData: Record<string, any> = {
                    'Student ID': student.id,
                    'Student Name': `${student.first_name} ${student.last_name}`,
                    Email: student.email,
                    Percentage:
                        typeof scorePercentage == 'number'
                            ? formatDecimalNumber(scorePercentage) + '%'
                            : '',
                    Judges: judges
                        .map((j) => `${j.first_name} ${j.last_name}`)
                        .join(', '),
                }
                data.push(rowData)
            }
        } else {
            if (!activity.max_score) {
                toast.error(
                    'Failed to get data to export. Please refresh and try again'
                )
                throw new Error(
                    'Failed to get data to export. Please refresh and try again'
                )
            }
            for (const student of students) {
                let judges: UserEssentialDetail[] = []
                if (activity.grouping_id != null && activity.groups) {
                    const group = activity.groups.find((g) =>
                        g.users.find((u) => u.id == student.id)
                    )

                    judges = group ? group.judges : []
                } else {
                    judges =
                        activity.students.find((s) => s.id == student.id)
                            ?.judges ?? []
                }

                let score: number | string = ''

                if (activity.grouping_id != null && activity.groups) {
                    const tmp = activity.groups
                        .flatMap((g) => g.users)
                        .find((u) => u.id == student.id)

                    score = tmp && tmp.score !== null ? tmp.score : ''
                } else {
                    const tmp = activity.students.find(
                        (s) => s.id == student.id
                    )

                    score = tmp && tmp.score !== null ? tmp.score : ''
                }

                const rowData: Record<string, any> = {
                    'Student ID': student.id,
                    'Student Name': `${student.first_name} ${student.last_name}`,
                    Email: student.email,
                    'Final Score': score,
                    'Max Score': activity.max_score,
                    Percentage:
                        typeof score == 'number'
                            ? formatDecimalNumber(
                                  (score / activity.max_score) * 100
                              ) + '%'
                            : '',
                    Judges: judges
                        .map((j) => `${j.first_name} ${j.last_name}`)
                        .join(', '),
                }

                data.push(rowData)
            }
        }
        return data
    }

    return (
        // <ScrollArea className="h-[calc(100vh-5rem)]">
        <ScrollArea>
            <div>
                {classroom.role === CLASSROOM_ROLE_TEACHER && (
                    <div className="mb-4 flex items-center gap-x-2">
                        <AssignJudgeAll
                            activityID={activity.id}
                            judges={judges}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <FileDown size={16} />
                                    Export Data
                                    <ChevronDown size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => exportData('csv', 'final')}
                                >
                                    <FileText size={16} className="mr-2" />
                                    Export Final Score (CSV)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => exportData('xlsx', 'final')}
                                >
                                    <FileSpreadsheet
                                        size={16}
                                        className="mr-2"
                                    />
                                    Export Final Score (Excel)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        exportData('csv', 'detailed')
                                    }
                                >
                                    <FileText size={16} className="mr-2" />
                                    Export Detailed Score (CSV)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        exportData('xlsx', 'detailed')
                                    }
                                >
                                    <FileSpreadsheet
                                        size={16}
                                        className="mr-2"
                                    />
                                    Export Detailed Score (Excel)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
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

function generateRubricScoreRow(
    sections: GetRubric['rubric_sections'],
    scoresFromJudge: GetRubricScoreFromJudge['scores']
) {
    const result: Record<string, any> = {}

    const fieldNameMentions: Record<string, number> = {}

    for (const section of sections) {
        for (const criteria of section.rubric_criterias) {
            const scoreInCriteria = scoresFromJudge.find(
                (cs) => cs.rubric_criteria_id == criteria.id
            )

            let outputStr = ''
            if (scoreInCriteria !== undefined) {
                outputStr = `${scoreInCriteria.score}/${criteria.max_score}`
            } else {
                outputStr = `-/${criteria.max_score}`
            }

            let fieldName = `${section.name} - ${criteria.name}`
            const timesFieldNameMentioned = fieldNameMentions[fieldName]

            if (timesFieldNameMentioned === undefined) {
                fieldNameMentions[fieldName] = 1
            } else {
                fieldNameMentions[fieldName] = timesFieldNameMentioned + 1
                fieldName += '_' + timesFieldNameMentioned
            }
            result[fieldName] = outputStr
        }
    }

    return result
}
