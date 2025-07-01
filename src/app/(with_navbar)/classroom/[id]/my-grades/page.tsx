import { formatDecimalNumber } from '@/lib/utils'
import { CLASSROOM_ROLE_STUDENT } from '@/types/classroom'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getActivities } from '../actions'
import ClassroomHeader from '../classroom-header'
import { GetMyGrades } from './actions'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const activities = await getActivities(id)

    if (!activities || activities.classroom.role !== CLASSROOM_ROLE_STUDENT) {
        return notFound()
    }

    activities.activities.reverse()
    activities.activities = activities.activities.filter(
        (a) => a.scoring_type !== null
    )

    const grades = await GetMyGrades(id)

    if (!grades) {
        return notFound()
    }

    return (
        <div className="pb-6 pt-4">
            <div className="mb-4 max-w-full">
                <ClassroomHeader
                    classroom={activities.classroom}
                    tab="grades"
                />
            </div>
            <section className="my-4">
                <div className="flex items-center justify-between border-b pb-5">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            Overall grade
                        </p>
                        <p className="text-3xl font-semibold text-paragon">
                            {formatDecimalNumber(grades.student.overall_score)}%
                        </p>
                    </div>
                </div>

                {/* Activity List */}
                <div className="space-y-4">
                    {activities.activities.map((activity) => {
                        // Find the grade for this activity
                        const activityGrade = grades.student.grades.find(
                            (g) => g.activity_id === activity.id
                        )

                        // We'll determine status by whether there's a grade
                        const hasGrade =
                            !!activityGrade && activityGrade.score !== null

                        return (
                            <Link
                                href={`/activity/${activity.id}`}
                                key={activity.id}
                                className="block"
                            >
                                <div className="rounded-md border p-4 hover:bg-accent/50 transition-colors">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-medium">
                                                {activity.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {activity.created_at &&
                                                    new Date(
                                                        activity.created_at
                                                    ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-medium">
                                                {hasGrade
                                                    ? `${formatDecimalNumber(activityGrade.score)}%`
                                                    : '--'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {hasGrade
                                                    ? 'Graded'
                                                    : 'Not graded'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}

                    {activities.activities.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No graded activities found.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
