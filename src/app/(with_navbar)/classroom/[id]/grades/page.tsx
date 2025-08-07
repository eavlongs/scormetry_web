import { CLASSROOM_ROLE_TEACHER } from '@/types/classroom'
import { notFound } from 'next/navigation'

import { getActivities } from '../actions'
import ClassroomHeader from '../classroom-header'
import { getClassroomGrades } from './actions'
import GradesTab from './grades-tab'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const activities = await getActivities(id)

    if (!activities || activities.classroom.role !== CLASSROOM_ROLE_TEACHER) {
        return notFound()
    }

    activities.activities.reverse()
    activities.activities = activities.activities.filter(
        (a) => a.scoring_type !== null
    )

    const grades = await getClassroomGrades(id)

    // return <GradesTab activities={activities} grades={grades} />
    return (
        <div className="pb-6 pt-4">
            <div className="mb-4 max-w-full">
                <ClassroomHeader
                    classroom={activities.classroom}
                    tab="grades"
                />
            </div>
            <section className="my-4">
                {grades && grades.length > 0 ? (
                    <GradesTab activities={activities} grades={grades} />
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No grades to display
                        </h3>
                        {activities.activities.length === 0 ? (
                            <p className="text-sm text-gray-600">
                                There are no graded activities in this classroom
                                yet.
                                <br />
                                Create activities with grading enabled to get
                                started.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Grades haven't been recorded yet. This could be
                                because:
                                <br />
                                • No students are enrolled in this classroom
                                <br />• Grades haven't been submitted for any
                                activities
                            </p>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}
