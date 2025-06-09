'use client'

import TinyEditor from '@/components/tiny-editor'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatBytes, getFileIcon } from '@/components/ui/file-upload'
import { Separator } from '@/components/ui/separator'
import { formatFileUrl } from '@/lib/utils'
import {
    CLASSROOM_ROLE_JUDGE,
    CLASSROOM_ROLE_STUDENT,
    CLASSROOM_ROLE_TEACHER,
    type Activity,
    type GetActivity,
} from '@/types/classroom'
import { ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import {
    deleteActivity,
    GetClassroomResponse,
} from '../../classroom/[id]/actions'
import DeleteActivityDialog from '../../classroom/[id]/delete-activity-dialog'
import ActivityCommentSection from './activity-comment-section'
import ActivityGroups from './activity-groups'
import ActivityScoreview from './activity-score-view'
import ActivityScoringDetail from './activity-scoring-detail'
import ActivityStudents from './activity-students'
import StudentViewScore from './student-view-score'

export default function ViewActivity({
    activity,
    classroom,
}: {
    activity: GetActivity
    classroom: GetClassroomResponse
}) {
    const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
        null
    )
    const router = useRouter()

    async function handleDeleteActivity(id: string) {
        const response = await deleteActivity(id, classroom.classroom.id)

        if (response.success) {
            setActivityToDelete(null)
            toast.success(response.message)
            router.push(`/classroom/${classroom.classroom.id}`)
            return
        }

        toast.error(response.message)
    }

    // Find category name if category_id exists
    const categoryName = activity.category_id
        ? classroom.categories.find((cat) => cat.id === activity.category_id)
              ?.name
        : null

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const renderSidePanel = useCallback(() => {
        if (activity.groups || activity.students) {
            return (
                <Accordion
                    type="multiple"
                    className="w-full"
                    defaultValue={['item-1', 'item-2']}
                >
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="cursor-pointer hover:no-underline text-base">
                            Scoring Detail
                        </AccordionTrigger>
                        <AccordionContent>
                            <ActivityScoringDetail activity={activity} />
                            <StudentViewScore
                                activity={activity}
                                classroom={classroom}
                            />
                        </AccordionContent>
                    </AccordionItem>
                    {activity.scoring_type != null &&
                        classroom.role !== CLASSROOM_ROLE_STUDENT && (
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="cursor-pointer hover:no-underline text-base pb-2">
                                    {activity.grouping_id !== null &&
                                    activity.groups ? (
                                        <div className="flex items-center gap-2 mb-2">
                                            {classroom.role ==
                                            CLASSROOM_ROLE_JUDGE ? (
                                                <h2 className="text-lg font-semibold">
                                                    My Assignments
                                                </h2>
                                            ) : (
                                                <>
                                                    <h2 className="text-lg font-semibold">
                                                        Groups
                                                    </h2>
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-auto"
                                                    >
                                                        {activity.groups.length}{' '}
                                                        groups
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mb-2">
                                            {classroom.role ==
                                            CLASSROOM_ROLE_JUDGE ? (
                                                <h2 className="text-lg font-semibold">
                                                    My Assignments
                                                </h2>
                                            ) : (
                                                <>
                                                    <h2 className="text-lg font-semibold">
                                                        Students
                                                    </h2>
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-auto"
                                                    >
                                                        {activity.students
                                                            ?.length || 0}{' '}
                                                        students
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </AccordionTrigger>
                                <AccordionContent>
                                    {activity.groups ? (
                                        <ActivityGroups
                                            activity={activity}
                                            groups={activity.groups}
                                            judges={activity.judges || []}
                                            classroom={classroom}
                                        />
                                    ) : (
                                        <ActivityStudents
                                            activity={activity}
                                            judges={activity.judges || []}
                                            classroom={classroom}
                                        />
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                </Accordion>
            )
        }

        return (
            <>
                <ActivityScoreview activity={activity} />
                <ActivityCommentSection activity={activity} />
            </>
        )
    }, [activity.groups, activity.students])

    return (
        <div className="grid grid-cols-1 md:grid-cols-10">
            <div className="relative pr-4 col-span-1 md:col-span-7 pb-4">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/classroom/${classroom.classroom.id}`}
                        className="text-sm opacity-70 cursor-pointer flex items-center mb-2"
                    >
                        <ArrowLeft
                            className="inline-block align-middle mr-1"
                            strokeWidth={1.5}
                            size={18}
                        />
                        Back to {classroom.classroom.name}
                    </Link>
                    {classroom.role === CLASSROOM_ROLE_TEACHER && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer"
                                >
                                    <MoreVertical size={10} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                side="bottom"
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                            >
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/activity/${activity.id}/edit`}
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                        setActivityToDelete(activity)
                                    }
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-x-2 mb-1">
                        <h1 className="text-3xl">{activity.title}</h1>
                        <div className="flex items-center gap-x-1">
                            {categoryName && (
                                <Badge variant="outline" className="">
                                    {categoryName}
                                </Badge>
                            )}

                            <Badge variant="paragon" className="">
                                {activity.grouping_id
                                    ? 'Group'
                                    : 'Individual'}{' '}
                            </Badge>
                        </div>
                    </div>

                    <p className="text-xs font-medium">
                        {activity.posted_by_user.first_name}{' '}
                        {activity.posted_by_user.last_name} -{' '}
                        {formatDate(activity.created_at)}
                        {new Date(activity.created_at).getTime() !==
                        new Date(activity.updated_at).getTime()
                            ? ' (Edited)'
                            : ''}
                    </p>
                </div>

                {/* <p className="text-sm">Description:</p> */}
                {activity.description.trim().length === 0 ? (
                    <p className="text-muted-foreground italic mt-3">
                        No instruction provided
                    </p>
                ) : (
                    <div className="mt-3 prose prose-sm max-w-none">
                        <TinyEditor
                            initialContent={activity.description}
                            readOnly
                            init={{
                                autoresize_min_height: 50,
                                autoresize_max_height: 500,
                            }}
                        />
                    </div>
                )}
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activity.files &&
                        activity.files.length > 0 &&
                        activity.files.map((file) => (
                            <Link
                                href={formatFileUrl(file.file_path)}
                                target="_blank"
                                key={file.id}
                                className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                {file.content_type.startsWith('image/') ? (
                                    <img
                                        src={formatFileUrl(file.file_path)}
                                        alt={file.file_name}
                                        className="w-8 h-8 rounded object-cover"
                                        onLoad={(event) => {
                                            if (
                                                !(
                                                    event.target instanceof
                                                    HTMLImageElement
                                                )
                                            )
                                                return
                                            URL.revokeObjectURL(
                                                event.target.src
                                            )
                                        }}
                                    />
                                ) : (
                                    getFileIcon(
                                        file.content_type,
                                        file.file_name
                                    )
                                )}
                                <div className="flex-1">
                                    <p className="text-sm line-clamp-1">
                                        {file.file_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatBytes(file.file_size)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>

            <div className="relative pl-4 gap-y-6 col-span-1 md:col-span-3 h-full">
                {/* TODO fix separator leaving space at the bottom  */}
                <div className="hidden md:block md:absolute left-0 top-[-0.5rem] bottom-0 min-h-[calc(100dvh-4rem)]">
                    <Separator orientation="vertical" className="h-full" />
                </div>

                {renderSidePanel()}
            </div>

            <DeleteActivityDialog
                activity={activityToDelete}
                onClose={() => setActivityToDelete(null)}
                onDelete={handleDeleteActivity}
            />
        </div>
    )
}
