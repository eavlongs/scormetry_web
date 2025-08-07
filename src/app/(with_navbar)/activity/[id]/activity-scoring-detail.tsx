import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ViewRubricDialog } from '@/components/view-rubric-dialog'
import { GetActivity } from '@/types/classroom'
import { useState } from 'react'

export default function ActivityScoringDetail({
    activity,
}: {
    activity: GetActivity
}) {
    const [showRubric, setShowRubric] = useState(false)
    return (
        <div>
            {activity.scoring_type === 'range' && (
                <span>
                    This activity is scored out of{' '}
                    <Badge variant="paragon">{activity.max_score} points</Badge>
                </span>
            )}

            {activity.scoring_type === 'rubric' && activity.rubric && (
                <div className="flex flex-col gap-y-2">
                    <p>This activity is scored using a rubric</p>
                    <Button onClick={() => setShowRubric(true)}>
                        View Rubric
                    </Button>
                    <ViewRubricDialog
                        isIndividualWork={activity.grouping_id === null}
                        open={showRubric}
                        onOpenChange={setShowRubric}
                        rubric={activity.rubric}
                    />
                </div>
            )}

            {activity.scoring_type === null && (
                <div>
                    This activity is <span className="font-bold">ungraded</span>
                </div>
            )}
        </div>
    )
}
