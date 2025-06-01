'use client'

import ConditionalTooltip from '@/components/conditional-tooltip'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { formatDecimalNumber } from '@/lib/utils'
import { UserEssentialDetail } from '@/types/auth'
import {
    GetActivity,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
} from '@/types/classroom'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../../classroom/[id]/actions'
import { getRangeScoreDetail, getRubricScoreDetail } from './actions'
import { ListUser } from './activity-groups'
import { ScoreData } from './score/score-activity'
import ViewScoreDetailDialog from './view-score-detail-dialog'

export default function StudentViewScore({
    activity,
    classroom,
}: {
    activity: GetActivity
    classroom: GetClassroomResponse
}) {
    return (
        activity.scoring_type !== null && (
            <div className="mt-4">
                {activity.group && <ListGroupWithJudges activity={activity} />}
                {activity.student && (
                    <ListStudentWclassroom activity={activity} />
                )}
            </div>
        )
    )
}

function ListStudentWclassroom({ activity }: { activity: GetActivity }) {
    const [studentToViewScoreDetail, setStudentToViewScoreDetail] =
        useState<NonNullable<typeof activity.student> | null>(null)
    const [scores, setScores] = useState<
        {
            judge: UserEssentialDetail
            comment: string
            data: ScoreData['range_based_scores'] | ScoreData['rubric_score']
        }[]
    >([])

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

    return (
        activity.student && (
            <>
                <Collapsible open={true} className="border rounded-lg bg-card">
                    <CollapsibleTrigger className="w-full">
                        <div className="px-4 py-3 border-b bg-muted/40 flex items-center gapx-x-2 hover:bg-muted/60 transition-colors cursor-pointer gap-x-2">
                            <div className="relative h-8 w-8 shrink-0 flex items-center gap-2 px-2">
                                <Image
                                    src={activity.student.profile_picture}
                                    alt={`${activity.student.first_name} ${activity.student.last_name}`}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0 text-start ml-2">
                                <p className="text-sm font-medium truncate">
                                    {activity.student.first_name}{' '}
                                    {activity.student.last_name}
                                </p>
                                <p className="h-5 px-0 text-xs text-muted-foreground justify-start font-normal truncate max-w-full">
                                    {activity.student.email}
                                </p>
                            </div>

                            <div className="ml-auto flex items-center gap-x-2">
                                {activity.rubric_id !== null ? (
                                    activity.student.score_percentage !==
                                        null && (
                                        <ConditionalTooltip
                                            text="See detail"
                                            show={true}
                                        >
                                            <Badge
                                                variant="outline"
                                                className="hover:border-black"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setStudentToViewScoreDetail(
                                                        activity.student
                                                    )
                                                }}
                                            >
                                                {formatDecimalNumber(
                                                    activity.student
                                                        .score_percentage
                                                )}
                                                /100
                                            </Badge>
                                        </ConditionalTooltip>
                                    )
                                ) : activity.student.score !== null ? (
                                    <ConditionalTooltip
                                        text="See detail"
                                        show={true}
                                    >
                                        <Badge
                                            variant="outline"
                                            className="hover:border-black"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setStudentToViewScoreDetail(
                                                    activity.student
                                                )
                                            }}
                                        >
                                            {formatDecimalNumber(
                                                activity.student.score
                                            )}
                                            /{activity.max_score}
                                        </Badge>
                                    </ConditionalTooltip>
                                ) : activity.student.score_percentage !==
                                  null ? (
                                    <ConditionalTooltip
                                        text="See detail"
                                        show={true}
                                    >
                                        <Badge
                                            variant="outline"
                                            className="hover:border-black"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setStudentToViewScoreDetail(
                                                    activity.student
                                                )
                                            }}
                                        >
                                            {formatDecimalNumber(
                                                activity.student
                                                    .score_percentage
                                            )}
                                            /100
                                        </Badge>
                                    </ConditionalTooltip>
                                ) : null}
                            </div>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="divide-y divide-border">
                        {activity.student.judges.map((judge) => (
                            <ListUser user={judge} isJudge key={judge.id} />
                        ))}
                    </CollapsibleContent>
                </Collapsible>
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
            </>
        )
    )
}

function ListGroupWithJudges({ activity }: { activity: GetActivity }) {
    const [groupToViewScoreDetail, setGroupToViewScoreDetail] = useState<
        typeof activity.group | null
    >(null)
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
    return (
        activity.group && (
            <>
                <Collapsible open={true} className="border rounded-lg bg-card">
                    <CollapsibleTrigger className="w-full">
                        <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between hover:bg-muted/60 transition-colors cursor-pointer">
                            <div className="w-full flex items-center gap-2 px-2">
                                <span className="font-medium">
                                    {activity.group.name}
                                </span>
                                <Badge variant="secondary">
                                    {activity.group.users.length} members
                                </Badge>
                            </div>
                            <div className="ml-auto flex items-center gap-x-2">
                                {activity.rubric_id !== null ? (
                                    activity.group.score_percentage !==
                                        null && (
                                        <ConditionalTooltip
                                            text="See detail"
                                            show={true}
                                        >
                                            <Badge
                                                variant="outline"
                                                className="hover:border-black"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setGroupToViewScoreDetail(
                                                        activity.group
                                                    )
                                                }}
                                            >
                                                {formatDecimalNumber(
                                                    activity.group
                                                        .score_percentage
                                                )}
                                                /100
                                            </Badge>
                                        </ConditionalTooltip>
                                    )
                                ) : activity.group.score !== null ? (
                                    <ConditionalTooltip
                                        text="See detail"
                                        show={true}
                                    >
                                        <Badge
                                            variant="outline"
                                            className="hover:border-black"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setGroupToViewScoreDetail(
                                                    activity.group
                                                )
                                            }}
                                        >
                                            {formatDecimalNumber(
                                                activity.group.score
                                            )}
                                            /{activity.max_score}
                                        </Badge>
                                    </ConditionalTooltip>
                                ) : activity.group.score_percentage !== null ? (
                                    <ConditionalTooltip
                                        text="See detail"
                                        show={true}
                                    >
                                        <Badge
                                            variant="outline"
                                            className="hover:border-black"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setGroupToViewScoreDetail(
                                                    activity.group
                                                )
                                            }}
                                        >
                                            {formatDecimalNumber(
                                                activity.group.score_percentage
                                            )}
                                            /100
                                        </Badge>
                                    </ConditionalTooltip>
                                ) : null}
                            </div>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="divide-y divide-border">
                        {activity.group.users.map((user) => (
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
                                          : user.score_percentage !== null
                                            ? `${formatDecimalNumber(
                                                  user.score_percentage
                                              )}/100`
                                            : undefined
                                }
                            />
                        ))}

                        {activity.group.judges.map((judge) => (
                            <ListUser user={judge} isJudge key={judge.id} />
                        ))}
                    </CollapsibleContent>
                </Collapsible>
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
            </>
        )
    )
}
