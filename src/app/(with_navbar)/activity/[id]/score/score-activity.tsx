'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
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
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
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

export type ScoreData = {
    range_based_scores?: RangeScore[]
    rubric_score?: RubricScoreContextType['scores']
}

const tmp = {
    id: 'rubric_001',
    has_weightage: true,
    max_score: 100,
    note: 'Final project evaluation rubric for CS 101 course',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-02-01T14:22:00Z',
    rubric_sections: [
        {
            id: 'section_001',
            rubric_id: 'rubric_001',
            name: 'Code Quality',
            description:
                'Assessment of code structure, readability, and best practices',
            is_group_score: false,
            score_percentage: 40,
            max_score: 40,
            order: 1,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            rubric_criterias: [
                {
                    id: 'criteria_001',
                    rubric_section_id: 'section_001',
                    name: 'Code Organization',
                    min_score: 0,
                    max_score: 20,
                    order: 1,
                    created_at: '2024-01-15T10:30:00Z',
                    updated_at: '2024-01-15T10:30:00Z',
                    criteria_score_ranges: [
                        {
                            id: 'range_001',
                            rubric_criteria_id: 'criteria_001',
                            name: 'Needs Improvement',
                            description:
                                'Code is poorly organized with confusing structure',
                            min_score: 0,
                            max_score: 9,
                            order: 1,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_002',
                            rubric_criteria_id: 'criteria_001',
                            name: 'Satisfactory',
                            description:
                                'Code has basic organization but lacks clarity in some areas',
                            min_score: 10,
                            max_score: 13,
                            order: 2,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_003',
                            rubric_criteria_id: 'criteria_001',
                            name: 'Good',
                            description:
                                'Code is mostly well-organized with minor structural issues',
                            min_score: 14,
                            max_score: 17,
                            order: 3,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_004',
                            rubric_criteria_id: 'criteria_001',
                            name: 'Excellent',
                            description:
                                'Code is well-organized with clear structure, proper modularity, and logical flow',
                            min_score: 18,
                            max_score: 20,
                            order: 4,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                    ],
                },
                {
                    id: 'criteria_002',
                    rubric_section_id: 'section_001',
                    name: 'Code Documentation',
                    min_score: 0,
                    max_score: 20,
                    order: 2,
                    created_at: '2024-01-15T10:30:00Z',
                    updated_at: '2024-01-15T10:30:00Z',
                    criteria_score_ranges: [
                        {
                            id: 'range_005',
                            rubric_criteria_id: 'criteria_002',
                            name: 'Needs Improvement',
                            description: 'Little to no documentation provided',
                            min_score: 0,
                            max_score: 9,
                            order: 1,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_006',
                            rubric_criteria_id: 'criteria_002',
                            name: 'Satisfactory',
                            description:
                                'Basic documentation present but incomplete',
                            min_score: 10,
                            max_score: 13,
                            order: 2,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_007',
                            rubric_criteria_id: 'criteria_002',
                            name: 'Good',
                            description:
                                'Good documentation with most functions and complex logic explained',
                            min_score: 14,
                            max_score: 17,
                            order: 3,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_008',
                            rubric_criteria_id: 'criteria_002',
                            name: 'Excellent',
                            description:
                                'Comprehensive documentation with clear comments and explanations',
                            min_score: 18,
                            max_score: 20,
                            order: 4,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                    ],
                },
            ],
        },
        {
            id: 'section_002',
            rubric_id: 'rubric_001',
            name: 'Functionality',
            description: 'Assessment of program functionality and correctness',
            is_group_score: false,
            score_percentage: 35,
            max_score: 35,
            order: 2,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            rubric_criterias: [
                {
                    id: 'criteria_003',
                    rubric_section_id: 'section_002',
                    name: 'Core Requirements',
                    min_score: 0,
                    max_score: 25,
                    order: 1,
                    created_at: '2024-01-15T10:30:00Z',
                    updated_at: '2024-01-15T10:30:00Z',
                    criteria_score_ranges: [
                        {
                            id: 'range_009',
                            rubric_criteria_id: 'criteria_003',
                            name: 'Needs Improvement',
                            description:
                                'Many core requirements missing or not working',
                            min_score: 0,
                            max_score: 12,
                            order: 1,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_010',
                            rubric_criteria_id: 'criteria_003',
                            name: 'Satisfactory',
                            description:
                                'Basic requirements met but some functionality missing',
                            min_score: 13,
                            max_score: 17,
                            order: 2,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_011',
                            rubric_criteria_id: 'criteria_003',
                            name: 'Good',
                            description:
                                'Most core requirements implemented with minor issues',
                            min_score: 18,
                            max_score: 22,
                            order: 3,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_012',
                            rubric_criteria_id: 'criteria_003',
                            name: 'Excellent',
                            description:
                                'All core requirements implemented correctly with no bugs',
                            min_score: 23,
                            max_score: 25,
                            order: 4,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                    ],
                },
                {
                    id: 'criteria_004',
                    rubric_section_id: 'section_002',
                    name: 'Error Handling',
                    min_score: 0,
                    max_score: 10,
                    order: 2,
                    created_at: '2024-01-15T10:30:00Z',
                    updated_at: '2024-01-15T10:30:00Z',
                    criteria_score_ranges: [
                        {
                            id: 'range_013',
                            rubric_criteria_id: 'criteria_004',
                            name: 'Needs Improvement',
                            description: 'Little to no error handling',
                            min_score: 0,
                            max_score: 4,
                            order: 1,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_014',
                            rubric_criteria_id: 'criteria_004',
                            name: 'Satisfactory',
                            description: 'Basic error handling present',
                            min_score: 5,
                            max_score: 6,
                            order: 2,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_015',
                            rubric_criteria_id: 'criteria_004',
                            name: 'Good',
                            description:
                                'Good error handling for most scenarios',
                            min_score: 7,
                            max_score: 8,
                            order: 3,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_016',
                            rubric_criteria_id: 'criteria_004',
                            name: 'Excellent',
                            description:
                                'Comprehensive error handling with graceful recovery',
                            min_score: 9,
                            max_score: 10,
                            order: 4,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                    ],
                },
            ],
        },
        {
            id: 'section_003',
            rubric_id: 'rubric_001',
            name: 'Presentation',
            description: 'Assessment of project presentation and demonstration',
            is_group_score: true,
            score_percentage: 25,
            max_score: 25,
            order: 3,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            rubric_criterias: [
                {
                    id: 'criteria_005',
                    rubric_section_id: 'section_003',
                    name: 'Clarity and Organization',
                    min_score: 0,
                    max_score: 15,
                    order: 1,
                    created_at: '2024-01-15T10:30:00Z',
                    updated_at: '2024-01-15T10:30:00Z',
                    criteria_score_ranges: [
                        {
                            id: 'range_017',
                            rubric_criteria_id: 'criteria_005',
                            name: 'Needs Improvement',
                            description:
                                'Presentation is unclear and poorly organized',
                            min_score: 0,
                            max_score: 7,
                            order: 1,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_018',
                            rubric_criteria_id: 'criteria_005',
                            name: 'Satisfactory',
                            description:
                                'Presentation has basic organization but lacks clarity',
                            min_score: 8,
                            max_score: 10,
                            order: 2,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_019',
                            rubric_criteria_id: 'criteria_005',
                            name: 'Good',
                            description:
                                'Presentation is mostly clear with good organization',
                            min_score: 11,
                            max_score: 13,
                            order: 3,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_020',
                            rubric_criteria_id: 'criteria_005',
                            name: 'Excellent',
                            description:
                                'Presentation is clear, well-organized, and engaging',
                            min_score: 14,
                            max_score: 15,
                            order: 4,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                    ],
                },
                {
                    id: 'criteria_006',
                    rubric_section_id: 'section_003',
                    name: 'Technical Demonstration',
                    min_score: 0,
                    max_score: 10,
                    order: 2,
                    created_at: '2024-01-15T10:30:00Z',
                    updated_at: '2024-01-15T10:30:00Z',
                    criteria_score_ranges: [
                        {
                            id: 'range_021',
                            rubric_criteria_id: 'criteria_006',
                            name: 'Needs Improvement',
                            description:
                                'Poor demonstration with major technical issues',
                            min_score: 0,
                            max_score: 4,
                            order: 1,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_022',
                            rubric_criteria_id: 'criteria_006',
                            name: 'Satisfactory',
                            description:
                                'Basic demonstration with some technical problems',
                            min_score: 5,
                            max_score: 6,
                            order: 2,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_023',
                            rubric_criteria_id: 'criteria_006',
                            name: 'Good',
                            description:
                                'Good demonstration with minor technical issues',
                            min_score: 7,
                            max_score: 8,
                            order: 3,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                        {
                            id: 'range_024',
                            rubric_criteria_id: 'criteria_006',
                            name: 'Excellent',
                            description:
                                'Flawless demonstration with all features working',
                            min_score: 9,
                            max_score: 10,
                            order: 4,
                            created_at: '2024-01-15T10:30:00Z',
                            updated_at: '2024-01-15T10:30:00Z',
                        },
                    ],
                },
            ],
        },
    ],
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
        if (entities.length > 0) {
            setSelectedEntity(entities[0])
        }
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

        const response = await saveScoringData(
            selectedEntity.activity_assignment_id,
            paramForValidationSchema,
            data
        )

        if (response.success) {
            toast.success('Scores saved successfully')
        } else {
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
                                                selectedEntity?.entity.id ===
                                                    entity.entity.id
                                                    ? 'bg-muted'
                                                    : 'hover:bg-muted/50 transition-colors'
                                            )}
                                            onClick={() =>
                                                setSelectedEntity(entity)
                                            }
                                            tabIndex={0}
                                            role="button"
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' ||
                                                    e.key === ' '
                                                ) {
                                                    setSelectedEntity(entity)
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
                                                                entity.entity
                                                                    .last_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {
                                                                entity.entity
                                                                    .email
                                                            }
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {entity.isScored ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                            )}
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
                    <div className="border rounded-lg bg-card shadow-sm overflow-hidden h-full py-4 px-4">
                        <div className="h-full overflow-y-auto flex flex-col gap-y-4">
                            <div>
                                {selectedEntity.type == 'group' ? (
                                    <p className="text-lg font-semibold">
                                        {selectedEntity.entity.name}
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-lg font-semibold">
                                            {selectedEntity.entity.first_name +
                                                ' ' +
                                                selectedEntity.entity.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedEntity.entity.email}
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="w-full flex flex-col flex-grow">
                                {activity.scoring_type === SCORING_TYPE_RANGE &&
                                    activity.max_score !== null &&
                                    scoreFetched && (
                                        <RangeScoreInput
                                            initialScores={
                                                initialScore.range_based_scores
                                            }
                                            entity={selectedEntity}
                                            onScoreUpdate={(scores) => {
                                                setScoreData({
                                                    rubric_score: undefined,
                                                    range_based_scores: scores,
                                                })
                                            }}
                                            maxScore={activity.max_score}
                                        />
                                    )}

                                {activity.scoring_type ===
                                    SCORING_TYPE_RUBRIC &&
                                    scoreFetched &&
                                    activity.rubric && (
                                        <div>
                                            <RubricScoreInput
                                                // rubric={activity.rubric}
                                                rubric={tmp}
                                                entity={selectedEntity}
                                                initialScores={
                                                    initialScore.rubric_score
                                                }
                                                parentErrors={errors}
                                                onScoreUpdate={(scores) =>
                                                    setScoreData({
                                                        range_based_scores:
                                                            undefined,
                                                        rubric_score: scores,
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
                                            options={{ required: false }}
                                        >
                                            <Textarea
                                                id="comment"
                                                placeholder="Provide detailed feedback..."
                                                rows={6}
                                                ref={commentRef}
                                                className="resize-none field-sizing-fixed"
                                            />
                                        </LabelWrapper>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="block ml-auto"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Score'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
