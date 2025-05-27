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
    GetGroupWithJudgePermission,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
} from '@/types/classroom'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../../classroom/[id]/actions'
import {
    assignJudgesToGroup,
    getRangeScoreDetail,
    getRubricScoreDetail,
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
        <ScrollArea>
            <div>
                <div className="mb-4">
                    <AssignJudgeAll activityID={activity.id} judges={judges} />
                </div>
                <div className="space-y-3">
                    {groups.map((group) => (
                        <Collapsible
                            key={group.id}
                            open={openGroups.includes(group.id)}
                            onOpenChange={() => toggleGroup(group.id)}
                            className="border rounded-lg bg-card"
                        >
                            <CollapsibleTrigger className="w-full">
                                <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between hover:bg-muted/60 transition-colors cursor-pointer">
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
                                            group.score_percentage !== null && (
                                                <ConditionalTooltip
                                                    text="See detail"
                                                    show={
                                                        classroom.role ==
                                                        CLASSROOM_ROLE_TEACHER
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
                                                            setGroupToViewScoreDetail(
                                                                group
                                                            )
                                                        }}
                                                    >
                                                        {formatDecimalNumber(
                                                            group.score_percentage
                                                        )}
                                                        /100
                                                    </Badge>
                                                </ConditionalTooltip>
                                            )
                                        ) : group.score !== null ? (
                                            <ConditionalTooltip
                                                text="See detail"
                                                show={
                                                    classroom.role ==
                                                    CLASSROOM_ROLE_TEACHER
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
                                                        setGroupToViewScoreDetail(
                                                            group
                                                        )
                                                    }}
                                                >
                                                    {formatDecimalNumber(
                                                        group.score
                                                    )}
                                                    /{activity.max_score}
                                                </Badge>
                                            </ConditionalTooltip>
                                        ) : group.score_percentage !== null ? (
                                            <ConditionalTooltip
                                                text="See detail"
                                                show={
                                                    classroom.role ==
                                                    CLASSROOM_ROLE_TEACHER
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
                                                        setGroupToViewScoreDetail(
                                                            group
                                                        )
                                                    }}
                                                >
                                                    {formatDecimalNumber(
                                                        group.score_percentage
                                                    )}
                                                    /100
                                                </Badge>
                                            </ConditionalTooltip>
                                        ) : null}
                                        <AssignJudgeButton
                                            onClick={() =>
                                                setGroupToAssignJudges(group)
                                            }
                                        />
                                        {group.permitted_to_judge && (
                                            <GiveScoreButton
                                                activityId={activity.id}
                                            />
                                        )}
                                        <ChevronDown
                                            className={cn(
                                                'h-4 w-4 text-muted-foreground transition-transform',
                                                openGroups.includes(group.id) &&
                                                    'transform rotate-180'
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
                                                ? user.score_percentage !== null
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
        </ScrollArea>
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
