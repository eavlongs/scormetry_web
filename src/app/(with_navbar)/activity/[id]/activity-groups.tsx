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
import { TextFileWriter } from '@/lib/text-file-writer'
import {
    cn,
    exportData,
    formatDecimalNumber,
    generateFileNameForExport,
} from '@/lib/utils'
import { UserEssentialDetail } from '@/types/auth'
import {
    CLASSROOM_ROLE_TEACHER,
    GetActivity,
    GetGroupWithJudgePermission,
    GetRubric,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
} from '@/types/classroom'
import { Prettify } from '@/types/general'
import {
    AlertCircle,
    ChevronDown,
    FileDown,
    FileSpreadsheet,
    FileText,
} from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { GetClassroomResponse } from '../../classroom/[id]/actions'
import {
    GetRangeScoreFromAJudge,
    GetRubricScoreFromJudge,
    assignJudgesToGroup,
    getRangeScoreDetail,
    getRubricScoreDetail,
    getScoresOfActivity,
} from './actions'
import AssignJudgeAll from './assign-judge-all'
import { AssignJudgeButton } from './assign-judge-button'
import { AssignJudgeDialog } from './assign-jugde-dialog'
import { GiveScoreButton } from './give-score-button'
import { ScoreData } from './score/score-activity'
import ViewScoreDetailDialog from './view-score-detail-dialog'

export default function ActivityGroups({
    activity,
    groups,
    judges,
    classroom,
}: {
    activity: GetActivity
    groups: GetGroupWithJudgePermission[]
    judges: UserEssentialDetail[]
    classroom: GetClassroomResponse
}) {
    const [openGroups, setOpenGroups] = useState<string[]>([])
    const [groupToAssignJudges, setGroupToAssignJudges] =
        useState<GetGroupWithJudgePermission | null>(null)
    const [groupToViewScoreDetail, setGroupToViewScoreDetail] =
        useState<GetGroupWithJudgePermission | null>(null)
    const [scores, setScores] = useState<
        {
            judge: UserEssentialDetail
            comment: string
            data: ScoreData['range_based_scores'] | ScoreData['rubric_score']
        }[]
    >([])

    const [groupToHighlight, setGroupToHighlight] = useState<string | null>(
        null
    )
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        async function fetchData() {
            if (!groupToViewScoreDetail) return
            if (activity.scoring_type == SCORING_TYPE_RUBRIC) {
                const response = await getRubricScoreDetail(
                    groupToViewScoreDetail.activity_assignment_id
                )

                if (response.success) {
                    setScores(response.data!)
                } else {
                    setGroupToViewScoreDetail(null)
                    toast.error(response.message)
                }
            } else if (activity.scoring_type == SCORING_TYPE_RANGE) {
                const response = await getRangeScoreDetail(
                    groupToViewScoreDetail.activity_assignment_id
                )

                if (response.success) {
                    setScores(response.data!)
                } else {
                    setGroupToViewScoreDetail(null)
                    toast.error(response.message)
                }
            }
        }
        fetchData()
    }, [groupToViewScoreDetail])

    useEffect(() => {
        if (searchParams.get('gid')) {
            const groupId = searchParams.get('gid')
            if (groupId && activity.groups) {
                const group = activity.groups.find((s) => s.id === groupId)
                if (group) {
                    toggleGroup(groupId)
                    setGroupToHighlight(groupId)
                }
            }
            setTimeout(() => router.replace(pathname), 3000)
        } else {
            setGroupToHighlight(null)
        }
    }, [searchParams])

    function toggleGroup(groupId: string) {
        setOpenGroups((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        )
    }

    async function handleAssignJudges(judgesId: string[]) {
        if (!groupToAssignJudges) return

        const response = await assignJudgesToGroup(
            activity.id,
            groupToAssignJudges.id,
            judgesId
        )

        if (response.success) {
            toast.success(response.message)
            setGroupToAssignJudges(null)
        } else {
            toast.error(response.message)
        }
    }

    return (
        // <ScrollArea className="h-[calc(100vh-5rem)]">
        // <ScrollArea>
        <div>
            {groups.length === 0 ? (
                <div className="border rounded-lg bg-card p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="rounded-full bg-muted p-3">
                            <AlertCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg">No groups found</h3>
                    </div>
                </div>
            ) : (
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
                                        onClick={() =>
                                            exportData(
                                                classroom,
                                                activity,
                                                'csv',
                                                'final'
                                            )
                                        }
                                    >
                                        <FileText size={16} className="mr-2" />
                                        Export Final Score (CSV)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            exportData(
                                                classroom,
                                                activity,
                                                'xlsx',
                                                'final'
                                            )
                                        }
                                    >
                                        <FileSpreadsheet
                                            size={16}
                                            className="mr-2"
                                        />
                                        Export Final Score (Excel)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            exportData(
                                                classroom,
                                                activity,
                                                'csv',
                                                'detailed'
                                            )
                                        }
                                    >
                                        <FileText size={16} className="mr-2" />
                                        Export Detailed Score (CSV)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            exportData(
                                                classroom,
                                                activity,
                                                'xlsx',
                                                'detailed'
                                            )
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
                    <div className="space-y-3">
                        {groups.map((group) => (
                            <Collapsible
                                key={group.id}
                                open={openGroups.includes(group.id)}
                                onOpenChange={() => toggleGroup(group.id)}
                                className="border rounded-lg bg-card"
                            >
                                <CollapsibleTrigger className="w-full">
                                    <div
                                        className={cn(
                                            `px-4 py-3 border-b bg-muted/40 flex items-center justify-between hover:bg-muted/60 transition-colors cursor-pointer`,
                                            groupToHighlight !== null &&
                                                groupToHighlight === group.id &&
                                                'border border-paragon relative animate-border-pulse'
                                        )}
                                    >
                                        <div className="w-full flex items-center gap-2 px-2">
                                            <span className="font-medium">
                                                {group.name}
                                            </span>
                                            <Badge variant="secondary">
                                                {group.users.length} members
                                            </Badge>
                                        </div>
                                        <div className="ml-auto flex items-center gap-x-2">
                                            {activity.rubric_id !== null ? (
                                                group.score_percentage !==
                                                    null && (
                                                    <ConditionalTooltip
                                                        text={
                                                            group.all_judge_scored
                                                                ? 'See detail'
                                                                : 'See detail (Not all judges has submitted yet)'
                                                        }
                                                        show={
                                                            classroom.role ==
                                                            CLASSROOM_ROLE_TEACHER
                                                        }
                                                    >
                                                        <ScoreBadge
                                                            isTeacher={
                                                                classroom.role ==
                                                                CLASSROOM_ROLE_TEACHER
                                                            }
                                                            allJudgesScored={
                                                                group.all_judge_scored
                                                            }
                                                            onClick={() =>
                                                                setGroupToViewScoreDetail(
                                                                    group
                                                                )
                                                            }
                                                        >
                                                            {classroom.role ==
                                                                CLASSROOM_ROLE_TEACHER &&
                                                                !group.all_judge_scored && (
                                                                    <AlertCircle color="red" />
                                                                )}
                                                            {formatDecimalNumber(
                                                                group.score_percentage
                                                            )}
                                                            /100
                                                        </ScoreBadge>
                                                    </ConditionalTooltip>
                                                )
                                            ) : group.score !== null ? (
                                                <ConditionalTooltip
                                                    text={
                                                        group.all_judge_scored
                                                            ? 'See detail'
                                                            : 'See detail (Not all judges has submitted yet)'
                                                    }
                                                    show={
                                                        classroom.role ==
                                                        CLASSROOM_ROLE_TEACHER
                                                    }
                                                >
                                                    <ScoreBadge
                                                        isTeacher={
                                                            classroom.role ==
                                                            CLASSROOM_ROLE_TEACHER
                                                        }
                                                        allJudgesScored={
                                                            group.all_judge_scored
                                                        }
                                                        onClick={() =>
                                                            setGroupToViewScoreDetail(
                                                                group
                                                            )
                                                        }
                                                    >
                                                        {classroom.role ==
                                                            CLASSROOM_ROLE_TEACHER &&
                                                            !group.all_judge_scored && (
                                                                <AlertCircle color="red" />
                                                            )}
                                                        {formatDecimalNumber(
                                                            group.score
                                                        )}
                                                        /{activity.max_score}
                                                    </ScoreBadge>
                                                </ConditionalTooltip>
                                            ) : group.score_percentage !==
                                              null ? (
                                                <ConditionalTooltip
                                                    text={
                                                        group.all_judge_scored
                                                            ? 'See detail'
                                                            : 'See detail (Not all judges has submitted yet)'
                                                    }
                                                    show={
                                                        classroom.role ==
                                                        CLASSROOM_ROLE_TEACHER
                                                    }
                                                >
                                                    <ScoreBadge
                                                        isTeacher={
                                                            classroom.role ==
                                                            CLASSROOM_ROLE_TEACHER
                                                        }
                                                        allJudgesScored={
                                                            group.all_judge_scored
                                                        }
                                                        onClick={() =>
                                                            setGroupToViewScoreDetail(
                                                                group
                                                            )
                                                        }
                                                    >
                                                        {classroom.role ==
                                                            CLASSROOM_ROLE_TEACHER &&
                                                            !group.all_judge_scored && (
                                                                <AlertCircle color="red" />
                                                            )}
                                                        {formatDecimalNumber(
                                                            group.score_percentage
                                                        )}
                                                        /100
                                                    </ScoreBadge>
                                                </ConditionalTooltip>
                                            ) : null}
                                            {classroom.role ==
                                                CLASSROOM_ROLE_TEACHER && (
                                                <AssignJudgeButton
                                                    onClick={() =>
                                                        setGroupToAssignJudges(
                                                            group
                                                        )
                                                    }
                                                />
                                            )}
                                            {group.permitted_to_judge && (
                                                <GiveScoreButton
                                                    activityId={activity.id}
                                                    groupId={group.id}
                                                />
                                            )}
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 text-muted-foreground transition-transform',
                                                    openGroups.includes(
                                                        group.id
                                                    ) && 'transform rotate-180'
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="divide-y divide-border">
                                    {group.users.map((user) => (
                                        <ListUser
                                            user={user}
                                            key={user.id}
                                            scoreString={
                                                activity.rubric_id !== null
                                                    ? user.score_percentage !==
                                                      null
                                                        ? `${formatDecimalNumber(user.score_percentage)}/100`
                                                        : undefined
                                                    : user.score !== null
                                                      ? `${formatDecimalNumber(user.score)}/${activity.max_score}`
                                                      : user.score_percentage !==
                                                          null
                                                        ? `${formatDecimalNumber(
                                                              user.score_percentage
                                                          )}/100`
                                                        : undefined
                                            }
                                        />
                                    ))}

                                    {group.judges.map((judge) => (
                                        <ListUser
                                            user={judge}
                                            isJudge
                                            key={judge.id}
                                        />
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                </div>
            )}
            <AssignJudgeDialog
                open={!!groupToAssignJudges}
                onClose={() => setGroupToAssignJudges(null)}
                judges={judges}
                selectedJudges={
                    groupToAssignJudges ? groupToAssignJudges.judges : []
                }
                onAssignJudges={handleAssignJudges}
            />

            <ViewScoreDetailDialog
                open={!!groupToViewScoreDetail}
                onOpenChange={(val) => {
                    if (!val) setGroupToViewScoreDetail(null)
                }}
                scores={scores}
                scoringEntity={
                    groupToViewScoreDetail !== null
                        ? {
                              isScored: true,
                              type: 'group',
                              activity_assignment_id:
                                  groupToViewScoreDetail.activity_assignment_id,
                              entity: groupToViewScoreDetail,
                          }
                        : null
                }
                activity={activity}
            />
            {/* </ScrollArea> */}
        </div>
    )
}

export function ListUser({
    user,
    isJudge = false,
    scoreString = '',
}: {
    user: UserEssentialDetail
    isJudge?: boolean
    scoreString?: string
}) {
    return (
        <div className="px-4 py-2.5 flex items-center gap-x-3 transition-colors hover:bg-muted/50">
            <div className="relative h-8 w-8 shrink-0">
                <Image
                    src={user.profile_picture}
                    alt={`${user.first_name} ${user.last_name}`}
                    fill
                    className="rounded-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                    {user.first_name} {user.last_name}
                </p>

                <p className="h-5 px-0 text-xs justify-start font-normal truncate max-w-full">
                    {user.email}
                </p>
            </div>

            {scoreString && <Badge variant="outline">{scoreString}</Badge>}
            {isJudge && <Badge variant="paragon">Judge</Badge>}
        </div>
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

export function ScoreBadge({
    isTeacher,
    allJudgesScored,
    children,
    onClick,
    ...props // needed for tooltip to work
}: {
    isTeacher: boolean
    allJudgesScored: boolean
    children: React.ReactNode
    onClick?: () => void
} & React.ComponentProps<typeof Badge>) {
    const shouldWarn = !allJudgesScored
    return (
        <Badge
            {...props}
            variant="outline"
            className={cn(
                isTeacher &&
                    (shouldWarn ? 'border-red-600' : 'hover:border-black')
            )}
            onClick={(e) => {
                if (!onClick) return
                e.stopPropagation()
                onClick()
            }}
        >
            {children}
        </Badge>
    )
}
