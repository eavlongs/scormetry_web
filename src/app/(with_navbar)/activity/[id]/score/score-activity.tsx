'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
    GetActivity,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
    ScoringEntity,
} from '@/types/classroom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RubricScoreInput } from './rubric-score-input'

type ScoreData = {
    score?: number
    comment: string
}

export default function ScoreActivity({ activity }: { activity: GetActivity }) {
    const [selectedEntity, setSelectedEntity] = useState<ScoringEntity | null>(
        null
    )
    const [entities, setEntities] = useState<ScoringEntity[]>([])
    const [scoreData, setScoreData] = useState<ScoreData>({ comment: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredEntities, setFilteredEntities] = useState<ScoringEntity[]>(
        []
    )

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
                    })
                }
            })
        } else if (activity.students && activity.students.length > 0) {
            activity.students.forEach((student) => {
                if (student.permitted_to_judge) {
                    entities.push({
                        type: 'individual',
                        entity: student,
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

    const handleScoreChange = (value: string) => {
        const numValue = value === '' ? undefined : Number(value)
        setScoreData((prev) => ({ ...prev, score: numValue }))
    }

    const handleCommentChange = (value: string) => {
        setScoreData((prev) => ({ ...prev, comment: value }))
    }

    const handleSubmit = async () => {
        if (!selectedEntity) return

        // Validation
        if (activity.scoring_type === SCORING_TYPE_RANGE) {
            if (scoreData.score === undefined) {
                toast.error('Please enter a score')
                return
            }

            const maxScore = activity.max_score || 100
            if (scoreData.score < 0 || scoreData.score > maxScore) {
                toast.error(`Score must be between 0 and ${maxScore}`)
                return
            }
        }

        setIsSubmitting(true)

        try {
            // This would be an actual API call to submit the score
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Update the entities list to mark this one as scored
            setEntities((prev) =>
                prev.map((entity) =>
                    entity.entity.id === selectedEntity.entity.id
                        ? { ...entity, isScored: true }
                        : entity
                )
            )
            setFilteredEntities((prev) =>
                prev.map((entity) =>
                    entity.entity.id === selectedEntity.entity.id
                        ? { ...entity, isScored: true }
                        : entity
                )
            )

            // toast.success(`Score submitted for ${selectedEntity.entity.name}`)

            // Clear form if needed or prepare for next entry
            // setScoreData({ comment: '' }) // Uncomment to clear after submission
        } catch (error) {
            toast.error('Failed to submit score. Please try again.')
            console.error('Error submitting score:', error)
        } finally {
            setIsSubmitting(false)
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
                        <div className="flex items-center justify-center h-full p-4 !max-w-[calc(100vw-3rem-1rem)]">
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
                                                <p className="text-sm font-medium truncate">
                                                    {entity.type == 'group' ? (
                                                        entity.entity.name
                                                    ) : (
                                                        <>
                                                            {entity.entity
                                                                .first_name +
                                                                ' ' +
                                                                entity.entity
                                                                    .last_name}

                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {
                                                                    entity
                                                                        .entity
                                                                        .email
                                                                }
                                                            </p>
                                                        </>
                                                    )}
                                                </p>
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
                            <p className="text-lg font-semibold">
                                {selectedEntity.type == 'group' ? (
                                    selectedEntity.entity.name
                                ) : (
                                    <>
                                        {selectedEntity.entity.first_name +
                                            ' ' +
                                            selectedEntity.entity.last_name}
                                        <p className="text-sm text-muted-foreground">
                                            {selectedEntity.entity.email}
                                        </p>
                                    </>
                                )}
                            </p>

                            <div className="w-full flex flex-col flex-grow">
                                {activity.scoring_type ===
                                    SCORING_TYPE_RANGE && (
                                    <div className="space-y-2">
                                        <Label htmlFor="score">
                                            Score (max:{' '}
                                            {activity.max_score || 100})
                                        </Label>
                                        <Input
                                            id="score"
                                            type="number"
                                            placeholder={`Enter score (0-${activity.max_score || 100})`}
                                            value={
                                                scoreData.score === undefined
                                                    ? ''
                                                    : scoreData.score
                                            }
                                            onChange={(e) =>
                                                handleScoreChange(
                                                    e.target.value
                                                )
                                            }
                                            className="max-w-xs"
                                        />
                                    </div>
                                )}

                                {activity.scoring_type ===
                                    SCORING_TYPE_RUBRIC &&
                                    activity.rubric && (
                                        <div>
                                            <RubricScoreInput
                                                rubric={activity.rubric}
                                                entity={selectedEntity}
                                            />
                                        </div>
                                    )}

                                <div className="flex-grow flex flex-col justify-end">
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
                                                value={scoreData.comment}
                                                onChange={(e) =>
                                                    handleCommentChange(
                                                        e.target.value
                                                    )
                                                }
                                                rows={6}
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
