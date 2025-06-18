'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Textarea } from '@/components/ui/textarea'
import { calculateRubricScore, cn, formatDecimalNumber } from '@/lib/utils'
import { CreateActivityScoreSchema } from '@/schema'
import {
    GetActivity,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
    SCORING_TYPES,
    ScoringEntity,
} from '@/types/classroom'
import { PATH_FOR_ERROR_TO_TOAST } from '@/types/general'
import { NestedPathValidationError } from '@/types/response'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import {
    getActivityAssignmentScoreForStudent,
    saveScoringData,
} from './actions'
import RangeScoreInput, { RangeScore } from './range-score-input'
import { RubricScoreInput } from './rubric-score-input'
import { RubricScoreContextType } from './rubric-score-provider'
import { ScoreInputVisibilityProvider } from './visibility-provider'

export type ScoreData = {
    range_based_scores?: RangeScore[]
    rubric_score?: RubricScoreContextType['scores']
}

export default function ScoreActivity({ activity }: { activity: GetActivity }) {
    const [selectedEntity, setSelectedEntity] = useState<ScoringEntity | null>(
        null
    )
    const [entities, setEntities] = useState<ScoringEntity[]>([])
    const [scoreData, setScoreData] = useState<ScoreData>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredEntities, setFilteredEntities] = useState<ScoringEntity[]>(
        []
    )
    const [initialScore, setInitialScore] = useState<ScoreData>({})
    const [scoreFetched, setScoreFetched] = useState(false)

    const [errors, setErrors] = useState<NestedPathValidationError[]>([])

    const commentRef = useRef<HTMLTextAreaElement>(null)

    const searchParams = useSearchParams()
    const [
        shouldAutomaticallySelectScoringEntity,
        setShouldAutomaticallySelectScoringEntity,
    ] = useState(true)

    const [itemsToHide, setItemsToHide] = useState<Set<string>>(new Set())
    const [triggerHideAll, setTriggerHideAll] = useState<boolean | null>(null)
    const [scorePreview, setScorePreview] = useState<ReturnType<
        typeof calculateRubricScore
    > | null>(null)

    useEffect(() => {
        console.log('updating preview')
        if (
            !selectedEntity ||
            activity.scoring_type !== SCORING_TYPE_RUBRIC ||
            activity.rubric === null ||
            scoreData.rubric_score === undefined
        )
            return

        if (scoreData.rubric_score.length == 0) {
            console.log('no score')
            setScorePreview({
                groupScore: null,
                individualScores: null,
                overallScore: null,
            })
            return
        }

        const result = calculateRubricScore(
            activity.rubric,
            scoreData.rubric_score
        )

        console.log({ result })

        setScorePreview(result)
    }, [scoreData, selectedEntity, activity])

    // const router = useRouter();
    const pathname = usePathname()

    useEffect(() => {
        if (!shouldAutomaticallySelectScoringEntity) return
        if (entities.length == 0) return
        if (searchParams.get('sid')) {
            const studentId = searchParams.get('sid')

            let entity: ScoringEntity | null = null

            for (const e of entities) {
                if (e.type == 'individual' && e.entity.id === studentId) {
                    entity = e
                    break
                } else if (e.type == 'group') {
                    for (const members of e.entity.users) {
                        if (members.id === studentId) {
                            entity = e
                            break
                        }
                    }
                }
            }

            if (entity) {
                setSelectedEntity(entity)
            } else {
                toast.error('You were not assigned as judge for this student')
            }
            setShouldAutomaticallySelectScoringEntity(false)
        } else if (searchParams.get('gid')) {
            const groupId = searchParams.get('gid')

            let entity: ScoringEntity | null = null

            for (const e of entities) {
                if (e.type == 'group' && e.entity.id === groupId) {
                    entity = e
                    break
                }
            }
            if (entity) {
                setSelectedEntity(entity)
            } else {
                toast.error('You were not assigned as judge this group')
            }
            setShouldAutomaticallySelectScoringEntity(false)
        }
    }, [searchParams, entities, shouldAutomaticallySelectScoringEntity])

    function showAll() {
        setItemsToHide(new Set())
    }

    // Initialize entities based on activity type (groups or individual students)
    useEffect(() => {
        const entities: ScoringEntity[] = []

        if (activity.groups && activity.groups.length > 0) {
            activity.groups.forEach((group) => {
                if (group.permitted_to_judge) {
                    entities.push({
                        type: 'group',
                        entity: group,
                        isScored: false,
                        activity_assignment_id: group.activity_assignment_id,
                    })
                }
            })
        } else if (activity.students && activity.students.length > 0) {
            activity.students.forEach((student) => {
                if (student.permitted_to_judge) {
                    entities.push({
                        type: 'individual',
                        entity: student,
                        activity_assignment_id: student.activity_assignment_id,
                        isScored: false, // This would be set based on actual scoring data
                    })
                }
            })
        }

        setEntities(entities)
        setFilteredEntities(entities)

        // Auto-select first entity if available
        // if (entities.length > 0) {
        //     setSelectedEntity(entities[0])
        // }
    }, [activity])

    useEffect(() => {
        if (!selectedEntity) return
        fetchScoreData()
    }, [selectedEntity])

    const fetchScoreData = useCallback(async () => {
        if (
            activity.scoring_type != SCORING_TYPE_RUBRIC &&
            activity.scoring_type != SCORING_TYPE_RANGE
        )
            return

        setScoreFetched(false)
        const response = await getActivityAssignmentScoreForStudent(
            selectedEntity!,
            activity.scoring_type as 'rubric' | 'range'
        )

        if (response.success) {
            if (!response.data) {
                setScoreData({
                    range_based_scores: undefined,
                    rubric_score: undefined,
                })
                return
            }
            // console.log('useeffect', { data: response.data.data })
            console.log(activity.scoring_type == 'range')
            console.log(Array.isArray(response.data.data.data))
            // console.log(response.data.data.data)
            console.log('score to be set', {
                range_based_scores:
                    activity.scoring_type == 'range' &&
                    Array.isArray(response.data.data.data)
                        ? (response.data.data.data as unknown as RangeScore[])
                        : undefined,
                rubric_score:
                    activity.scoring_type == 'rubric' &&
                    Array.isArray(response.data.data.data)
                        ? (response.data.data
                              .data as unknown as RubricScoreContextType['scores'])
                        : undefined,
            })
            setInitialScore({
                range_based_scores:
                    activity.scoring_type == 'range' &&
                    Array.isArray(response.data.data.data)
                        ? (response.data.data.data as unknown as RangeScore[])
                        : undefined,
                rubric_score:
                    activity.scoring_type == 'rubric' &&
                    Array.isArray(response.data.data.data)
                        ? (response.data.data
                              .data as unknown as RubricScoreContextType['scores'])
                        : undefined,
            })
            if (commentRef.current) {
                commentRef.current.value = response.data.data.comment || ''
            }
        } else {
            toast.error(response.message)
        }

        setScoreFetched(true)
    }, [selectedEntity, activity.scoring_type])

    // Filter entities based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredEntities(entities)
            return
        }

        const filtered = entities.filter((entity) => {
            if (entity.type === 'group') {
                return entity.entity.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            } else {
                return (
                    (
                        entity.entity.first_name.toLowerCase() +
                        ' ' +
                        entity.entity.last_name.toLowerCase()
                    ).includes(searchQuery.toLowerCase()) ||
                    entity.entity.email
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
                )
            }
        })
        setFilteredEntities(filtered)
    }, [searchQuery, entities])

    async function handleSubmit() {
        if (!selectedEntity) return

        const comment = commentRef.current ? commentRef.current.value : ''

        const scoringType = activity.scoring_type

        if (
            !scoringType ||
            !(Array.from(SCORING_TYPES) as string[]).includes(scoringType)
        )
            return null

        let data: z.infer<ReturnType<typeof CreateActivityScoreSchema>> | null =
            null

        let paramForValidationSchema:
            | Parameters<typeof CreateActivityScoreSchema>[0]
            | null = null
        if (scoringType == 'range' && activity.max_score !== null) {
            data = {
                comment: comment,
                data: scoreData.range_based_scores ?? [],
            }
            paramForValidationSchema = {
                type: 'range',
                max_score: activity.max_score,
            }
        } else if (scoringType == 'rubric') {
            const rubricCriterias = activity.rubric
                ? activity.rubric.rubric_sections.flatMap(
                      (s) => s.rubric_criterias
                  )
                : []
            paramForValidationSchema = {
                type: 'rubric',
                rubric_criterias: rubricCriterias,
            }

            if (!scoreData.rubric_score) {
                data = {
                    comment: comment,
                    data: [],
                }
            } else {
                data = {
                    comment: comment,
                    data: scoreData.rubric_score,
                }
            }
        } else return

        setIsSubmitting(true)
        const response = await saveScoringData(
            selectedEntity.activity_assignment_id,
            paramForValidationSchema,
            data
        )

        if (response.success) {
            toast.success('Scores saved successfully')
            setIsSubmitting(false)
        } else {
            setIsSubmitting(false)
            if (response.error && response.error.length > 0) {
                for (const error of response.error) {
                    if (
                        Array.isArray(error.field) &&
                        error.field.join(',') == PATH_FOR_ERROR_TO_TOAST
                    ) {
                        toast.error(error.message)
                        return
                    }
                }
                toast.error(response.error[0].message)
                return
            }
            toast.error(response.message)
        }
    }

    return (
        <div>
            <Link
                href={`/activity/${activity.id}`}
                className="text-sm opacity-70 cursor-pointer flex items-center mb-4"
            >
                <ArrowLeft
                    className="inline-block align-middle mr-1"
                    strokeWidth={1.5}
                    size={18}
                />
                Back to {activity.title}
            </Link>
            <div className="grid lg:grid-cols-5 gap-4 mb-4">
                {/* Left side: Student/Group list */}
                <div className="border rounded-lg bg-card lg:row-span-full overflow-y-auto">
                    <div className="p-3 border-b bg-muted/40">
                        <h2 className="font-medium">
                            {activity.groups ? 'Groups' : 'Students'} to Score
                        </h2>
                    </div>
                    <div>
                        {entities.length === 0 ? (
                            <div className="flex items-center justify-center h-full p-4 ">
                                <p className="text-muted-foreground">
                                    No students or groups assigned for scoring
                                </p>
                            </div>
                        ) : (
                            <div className="">
                                <div className="p-2 sticky top-0 bg-background z-10">
                                    <Input
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-1">
                                    {filteredEntities.length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground">
                                            No results found
                                        </p>
                                    ) : (
                                        filteredEntities.map((entity) => (
                                            <div
                                                key={entity.entity.id}
                                                className={cn(
                                                    'flex items-center p-3 rounded-md cursor-pointer gap-3',
                                                    selectedEntity?.entity
                                                        .id === entity.entity.id
                                                        ? 'bg-muted'
                                                        : 'hover:bg-muted/50 transition-colors'
                                                )}
                                                onClick={
                                                    () => {
                                                        let searchParam = ''
                                                        if (
                                                            entity.type ==
                                                            'group'
                                                        )
                                                            searchParam = `?gid=${entity.entity.id}`
                                                        else {
                                                            searchParam = `?sid=${entity.entity.id}`
                                                        }
                                                        window.location.href = `${pathname}${searchParam}`
                                                    }
                                                    // setSelectedEntity(entity)
                                                }
                                                tabIndex={0}
                                                role="button"
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' ||
                                                        e.key === ' '
                                                    ) {
                                                        setSelectedEntity(
                                                            entity
                                                        )
                                                    }
                                                }}
                                            >
                                                {entity.type == 'group' ? (
                                                    <div className="h-10 w-10 rounded-md bg-muted-foreground/10 flex items-center justify-center">
                                                        <Badge variant="outline">
                                                            {entity.entity.name.substring(
                                                                0,
                                                                2
                                                            )}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <div className="relative h-10 w-10">
                                                        <Image
                                                            src={
                                                                entity.entity
                                                                    .profile_picture
                                                            }
                                                            alt={
                                                                entity.entity
                                                                    .first_name +
                                                                ' ' +
                                                                entity.entity
                                                                    .last_name
                                                            }
                                                            fill
                                                            className="rounded-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    {entity.type == 'group' ? (
                                                        <p className="text-sm font-medium truncate">
                                                            {entity.entity.name}
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-medium truncate">
                                                                {' '}
                                                                {entity.entity
                                                                    .first_name +
                                                                    ' ' +
                                                                    entity
                                                                        .entity
                                                                        .last_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {
                                                                    entity
                                                                        .entity
                                                                        .email
                                                                }
                                                            </p>
                                                        </>
                                                    )}
                                                </div>

                                                {/* {entity.isScored ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                                )} */}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Scoring interface */}
                <div className="lg:col-span-4 !w-full min-w-0 lg:row-span-full">
                    {!selectedEntity ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                                No student or group selected
                            </p>
                        </div>
                    ) : (
                        <ScoreInputVisibilityProvider
                            value={{
                                itemsToHide: itemsToHide,
                                triggerHideAll: triggerHideAll,
                                hide: (ids: string[]) => {
                                    setItemsToHide((prev) => {
                                        const newSet = new Set(prev)
                                        ids.forEach((id) => newSet.add(id))
                                        return newSet
                                    })
                                },
                                show: (ids: string[]) => {
                                    setItemsToHide((prev) => {
                                        const newSet = new Set(prev)
                                        ids.forEach((id) => newSet.delete(id))
                                        return newSet
                                    })
                                },
                                showAll: showAll,
                            }}
                        >
                            <div className="border rounded-lg bg-card shadow-sm overflow-hidden h-full py-4 px-4">
                                <div className="h-full overflow-y-auto flex flex-col gap-y-4">
                                    <div className="flex gap-x-2 items-center">
                                        {selectedEntity.type == 'group' ? (
                                            <p className="text-lg font-semibold">
                                                {selectedEntity.entity.name}
                                            </p>
                                        ) : (
                                            <>
                                                <p className="text-lg font-semibold">
                                                    {selectedEntity.entity
                                                        .first_name +
                                                        ' ' +
                                                        selectedEntity.entity
                                                            .last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        selectedEntity.entity
                                                            .email
                                                    }
                                                </p>
                                            </>
                                        )}

                                        {itemsToHide.size == 0 ? (
                                            <SimpleToolTip text="Hide all scores">
                                                <Eye
                                                    onClick={() =>
                                                        setTriggerHideAll(
                                                            (prev) => {
                                                                if (
                                                                    prev ===
                                                                    null
                                                                ) {
                                                                    return true
                                                                }
                                                                return !prev
                                                            }
                                                        )
                                                    }
                                                />
                                            </SimpleToolTip>
                                        ) : (
                                            <SimpleToolTip text="Show all scores">
                                                <EyeOff onClick={showAll} />
                                            </SimpleToolTip>
                                        )}
                                    </div>

                                    <div className="w-full flex flex-col flex-grow">
                                        {activity.scoring_type ===
                                            SCORING_TYPE_RANGE &&
                                            activity.max_score !== null &&
                                            scoreFetched && (
                                                <RangeScoreInput
                                                    initialScores={
                                                        initialScore.range_based_scores
                                                    }
                                                    entity={selectedEntity}
                                                    onScoreUpdate={(scores) => {
                                                        setScoreData({
                                                            rubric_score:
                                                                undefined,
                                                            range_based_scores:
                                                                scores,
                                                        })
                                                    }}
                                                    maxScore={
                                                        activity.max_score
                                                    }
                                                />
                                            )}

                                        {activity.scoring_type ===
                                            SCORING_TYPE_RUBRIC &&
                                            scoreFetched &&
                                            activity.rubric && (
                                                <div>
                                                    <RubricScoreInput
                                                        rubric={activity.rubric}
                                                        entity={selectedEntity}
                                                        initialScores={
                                                            initialScore.rubric_score
                                                        }
                                                        parentErrors={errors}
                                                        onScoreUpdate={(
                                                            scores
                                                        ) =>
                                                            setScoreData({
                                                                range_based_scores:
                                                                    undefined,
                                                                rubric_score:
                                                                    scores,
                                                            })
                                                        }
                                                        onSetParentErrors={() =>
                                                            setErrors([])
                                                        }
                                                    />
                                                </div>
                                            )}

                                        <div className="flex-grow flex flex-col justify-end mt-4">
                                            <div className="space-y-4">
                                                <LabelWrapper
                                                    label={{
                                                        text: 'Feedback',
                                                        field: 'comment',
                                                    }}
                                                    options={{
                                                        required: false,
                                                    }}
                                                >
                                                    <Textarea
                                                        id="comment"
                                                        placeholder="Provide detailed feedback..."
                                                        rows={6}
                                                        ref={commentRef}
                                                        className="resize-none field-sizing-fixed"
                                                    />
                                                </LabelWrapper>
                                                {activity.scoring_type ===
                                                    SCORING_TYPE_RUBRIC && (
                                                    <div className="border rounded-md p-4 bg-muted/30 mb-4 mt-6">
                                                        <h3 className="font-medium mb-3">
                                                            Your Score Overview
                                                        </h3>

                                                        {selectedEntity?.type ===
                                                        'group' ? (
                                                            <div className="space-y-3">
                                                                {/* For each group member */}
                                                                {selectedEntity.entity.users.map(
                                                                    (user) => (
                                                                        <div
                                                                            key={
                                                                                user.id
                                                                            }
                                                                            className="flex justify-between items-center"
                                                                        >
                                                                            <span>
                                                                                {`${user.first_name} ${user.last_name}`}
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                {scorePreview &&
                                                                                scorePreview.individualScores
                                                                                    ? (() => {
                                                                                          const userScore =
                                                                                              scorePreview.individualScores.find(
                                                                                                  (
                                                                                                      is
                                                                                                  ) =>
                                                                                                      is.student_id ==
                                                                                                      user.id
                                                                                              )?.score
                                                                                          return userScore !==
                                                                                              undefined
                                                                                              ? formatDecimalNumber(
                                                                                                    userScore
                                                                                                ) +
                                                                                                    '/100'
                                                                                              : '--/100'
                                                                                      })()
                                                                                    : '--/100'}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                )}
                                                                <div className="border-t pt-3 mt-2 flex justify-between items-center">
                                                                    <span className="font-medium">
                                                                        Overall
                                                                        Group
                                                                        Score
                                                                    </span>
                                                                    <span className="font-bold">
                                                                        {scorePreview &&
                                                                        scorePreview.overallScore
                                                                            ? formatDecimalNumber(
                                                                                  scorePreview.overallScore
                                                                              ) +
                                                                              '/100'
                                                                            : '--/100'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium">
                                                                    Overall
                                                                    Score
                                                                </span>
                                                                <span className="font-bold">
                                                                    {scorePreview &&
                                                                    scorePreview.overallScore
                                                                        ? formatDecimalNumber(
                                                                              scorePreview.overallScore
                                                                          ) +
                                                                          '/100'
                                                                        : '--/100'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting}
                                                    className="block ml-auto"
                                                >
                                                    {isSubmitting ? (
                                                        <>Submitting...</>
                                                    ) : (
                                                        'Submit Score'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScoreInputVisibilityProvider>
                    )}
                </div>
            </div>
        </div>
    )
}
