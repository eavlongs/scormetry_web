import { cn } from '@/lib/utils'
import {
    CLASSROOM_ROLE_JUDGE,
    CLASSROOM_ROLE_STUDENT,
    CLASSROOM_ROLE_TEACHER,
    ClassroomRole,
    colorMap,
} from '@/types/classroom'
import Link from 'next/link'
import { getClassrooms } from '../actions'
import CreateClassroomButton from '../classroom/[id]/create-classroom-button'

export default async function Page() {
    const classrooms = await getClassrooms()
    const allClassrooms = [
        ...classrooms.judging_classrooms,
        ...classrooms.studying_classrooms,
        ...classrooms.teaching_classrooms,
    ].sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">My Classrooms</h1>
            </div>

            {allClassrooms && allClassrooms.length > 0 ? (
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                    {allClassrooms.map((classroom) => {
                        // Determine role label
                        let roleType: ClassroomRole = CLASSROOM_ROLE_STUDENT
                        if (
                            classrooms.teaching_classrooms.some(
                                (c) => c.id === classroom.id
                            )
                        ) {
                            roleType = CLASSROOM_ROLE_TEACHER
                        } else if (
                            classrooms.studying_classrooms.some(
                                (c) => c.id === classroom.id
                            )
                        ) {
                            roleType = CLASSROOM_ROLE_STUDENT
                        } else if (
                            classrooms.judging_classrooms.some(
                                (c) => c.id === classroom.id
                            )
                        ) {
                            roleType = CLASSROOM_ROLE_JUDGE
                        }

                        return (
                            <Link
                                href={`/classroom/${classroom.id}`}
                                key={classroom.id}
                                className="w-full sm:w-[260px]"
                            >
                                <div className="relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 h-full">
                                    {/* Top color bar */}
                                    <div
                                        className={cn(
                                            'h-2 w-full',
                                            colorMap[classroom.color]
                                        )}
                                    ></div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center">
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    {classroom.name}
                                                </h2>
                                            </div>
                                        </div>

                                        {roleType && (
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="capitalize text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                                    {roleType}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg bg-gray-50">
                    <div className="mb-4 text-gray-400">
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                        No classrooms found
                    </h3>
                    <p className="text-gray-500 mb-4 text-center">
                        If you are a teacher, you can create your first
                        classroom.
                        <br />
                        If you are a student, you can ask your teacher to invite
                        you to a classroom.
                    </p>
                    <CreateClassroomButton />
                </div>
            )}
        </div>
    )
}
