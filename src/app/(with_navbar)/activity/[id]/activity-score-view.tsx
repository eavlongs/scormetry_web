'use client'

import { Button } from '@/components/ui/button'
import { GetActivity } from '@/types/classroom'

export default function ActivityScoreview({
    activity,
}: {
    activity: GetActivity
}) {
    return (
        activity.scoring_type && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col gap-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                            Score
                        </span>
                    </div>

                    <div className="flex flex-col items-center">
                        {activity.scoring_type === 'range' ? (
                            <div className="flex flex-col items-center">
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-primary">
                                        {9 || '-'}
                                    </span>
                                    <span className="text-lg text-muted-foreground mx-2">
                                        /
                                    </span>
                                    <span className="text-2xl">
                                        {activity.max_score}
                                    </span>
                                </div>
                                <span className="text-sm text-muted-foreground mt-1">
                                    points
                                </span>
                            </div>
                        ) : activity.scoring_type === 'rubric' ? (
                            <div className="flex flex-col items-center">
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-primary">
                                        {'90' || '-'}
                                    </span>
                                    <span className="text-lg text-muted-foreground mx-2">
                                        /
                                    </span>
                                    <span className="text-2xl">100</span>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {activity.scoring_type === 'rubric' &&
                        activity.rubric_id && (
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full mt-2 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
                                onClick={() => {
                                    /* Open rubric details modal */
                                }}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    See Criteria
                                </span>
                            </Button>
                        )}
                </div>
            </div>
        )
    )
}
