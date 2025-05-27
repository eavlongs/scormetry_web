import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { UserEssentialDetail } from '@/types/auth'
import {
    GetActivity,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
    ScoringEntity,
} from '@/types/classroom'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import RangeScoreView from './range-score-view'
import { RubricScoreView } from './rubric-score-view'
import { ScoreData } from './score/score-activity'

export default function ViewScoreDetailDialog({
    open,
    onOpenChange,
    activity,
    scores,
    scoringEntity,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    activity: GetActivity
    scores: {
        judge: UserEssentialDetail
        comment: string
        data: ScoreData['range_based_scores'] | ScoreData['rubric_score']
    }[]
    scoringEntity: ScoringEntity | null
}) {
    const [selectedJudge, setSelectedJudge] =
        useState<UserEssentialDetail | null>(null)
    const commentRef = useRef<HTMLTextAreaElement>(null)
    const [score, setScore] = useState<
        ScoreData['range_based_scores'] | ScoreData['rubric_score'] | null
    >(null)

    useEffect(() => {
        if (selectedJudge) {
            const _score = scores.find(
                (score) => score.judge.id === selectedJudge?.id
            )?.data
            setScore(_score)
        }
    }, [selectedJudge])

    useEffect(() => {
        if (scores.length > 0) {
            // Set the first judge as selected by default
            setSelectedJudge(scores[0].judge)
        }
    }, [scores])

    return (
        <Dialog
            open={open && scoringEntity != null}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="w-screen h-screen !max-w-none flex flex-col p-0 m-0 rounded-none overflow-y-auto">
                <DialogHeader className="px-6 py-2 border-b sticky top-0 bg-background z-10">
                    <div className="flex items-center">
                        <DialogTitle>
                            Score Detail for{' '}
                            {scoringEntity && scoringEntity.type == 'group'
                                ? scoringEntity.entity.name
                                : scoringEntity?.entity.first_name +
                                  ' ' +
                                  scoringEntity?.entity.last_name}
                        </DialogTitle>
                        <Button
                            className="ml-auto"
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid lg:grid-cols-5 gap-4 mb-4">
                    {/* Left side: Student/Group list */}
                    <div className="border rounded-lg bg-card lg:row-span-full overflow-y-auto">
                        {/* <div className="p-3 border-b bg-muted/40">
                            <h2 className="font-medium">
                                {activity.groups ? 'Groups' : 'Students'} to
                                Score
                            </h2>
                        </div> */}
                        <div>
                            {scores.length === 0 ? (
                                <div className="flex items-center justify-center h-full p-4 !max-w-[calc(100vw-3rem-1rem)]">
                                    <p className="text-muted-foreground">
                                        No judges found
                                    </p>
                                </div>
                            ) : (
                                <div className="">
                                    {/* <div className="p-2 sticky top-0 bg-background z-10">
                                        <Input
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="w-full"
                                        />
                                    </div> */}
                                    <div className="space-y-1">
                                        {scores.length === 0 ? (
                                            <p className="p-4 text-sm text-muted-foreground">
                                                No judges found
                                            </p>
                                        ) : (
                                            <>
                                                <div className="p-3 border-b bg-muted/40">
                                                    <h2 className="font-medium">
                                                        Judges
                                                    </h2>
                                                </div>

                                                {scores.map((score) => (
                                                    <div
                                                        key={score.judge.id}
                                                        className={cn(
                                                            'flex items-center p-3 rounded-md cursor-pointer gap-3',
                                                            selectedJudge &&
                                                                selectedJudge.id ===
                                                                    score.judge
                                                                        .id
                                                                ? 'bg-muted'
                                                                : 'hover:bg-muted/50 transition-colors'
                                                        )}
                                                        onClick={() =>
                                                            setSelectedJudge(
                                                                score.judge
                                                            )
                                                        }
                                                        tabIndex={0}
                                                        role="button"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    'Enter' ||
                                                                e.key === ' '
                                                            ) {
                                                                setSelectedJudge(
                                                                    score.judge
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        <div className="relative h-10 w-10">
                                                            <Image
                                                                src={
                                                                    score.judge
                                                                        .profile_picture
                                                                }
                                                                alt={
                                                                    score.judge
                                                                        .first_name +
                                                                    ' ' +
                                                                    score.judge
                                                                        .last_name
                                                                }
                                                                fill
                                                                className="rounded-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {score.judge
                                                                    .first_name +
                                                                    ' ' +
                                                                    score.judge
                                                                        .last_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {
                                                                    score.judge
                                                                        .email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side: Scoring interface */}
                    <div className="lg:col-span-4 !w-full min-w-0 lg:row-span-full">
                        {!selectedJudge ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">
                                    Please select a judge
                                </p>
                            </div>
                        ) : (
                            <div className="border rounded-lg bg-card shadow-sm overflow-hidden h-full py-4 px-4">
                                <div className="h-full overflow-y-auto flex flex-col gap-y-4">
                                    <div>
                                        {scoringEntity &&
                                            (scoringEntity.type ==
                                            'individual' ? (
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="relative h-10 w-10">
                                                        <Image
                                                            src={
                                                                scoringEntity
                                                                    .entity
                                                                    .profile_picture
                                                            }
                                                            alt={
                                                                scoringEntity
                                                                    .entity
                                                                    .first_name +
                                                                ' ' +
                                                                scoringEntity
                                                                    .entity
                                                                    .last_name
                                                            }
                                                            fill
                                                            className="rounded-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-semibold">
                                                            {scoringEntity
                                                                .entity
                                                                .first_name +
                                                                ' ' +
                                                                scoringEntity
                                                                    .entity
                                                                    .last_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                scoringEntity
                                                                    .entity
                                                                    .email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-lg font-semibold">
                                                    {scoringEntity.entity.name}
                                                </p>
                                            ))}
                                    </div>

                                    <div className="w-full flex flex-col flex-grow">
                                        {activity.scoring_type ===
                                            SCORING_TYPE_RANGE &&
                                            scoringEntity &&
                                            activity.max_score !== null && (
                                                <RangeScoreView
                                                    initialScores={
                                                        scores.find(
                                                            (score) =>
                                                                score.judge
                                                                    .id ==
                                                                selectedJudge.id
                                                        )
                                                            ?.data as ScoreData['range_based_scores']
                                                    }
                                                    entity={scoringEntity}
                                                    maxScore={
                                                        activity.max_score
                                                    }
                                                />
                                            )}

                                        {activity.scoring_type ===
                                            SCORING_TYPE_RUBRIC &&
                                            scoringEntity &&
                                            activity.rubric && (
                                                <div>
                                                    <RubricScoreView
                                                        rubric={activity.rubric}
                                                        entity={scoringEntity}
                                                        initialScores={
                                                            score as ScoreData['rubric_score']
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
                                                        value={
                                                            scores.find(
                                                                (s) =>
                                                                    s.judge
                                                                        .id ==
                                                                    selectedJudge.id
                                                            )?.comment
                                                        }
                                                        readOnly
                                                        disabled
                                                        ref={commentRef}
                                                        className="resize-none field-sizing-fixed"
                                                    />
                                                </LabelWrapper>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
