'use client'

import QuillEditor from '@/components/quill-editor'
import { SimpleToolTip } from '@/components/simple-tooltip'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBytes, getFileIcon } from '@/components/ui/file-upload'
import { Separator } from '@/components/ui/separator'
import { copyToClipboard, formatFileUrl } from '@/lib/utils'
import type { GetActivity } from '@/types/classroom'
import { ArrowLeft, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback } from 'react'
import { GetClassroomResponse } from '../../classroom/[id]/actions'
import ActivityCommentSection from './activity-comment-section'
import ActivityGroups from './activity-groups'
import ActivityScoreview from './activity-score-view'
import ActivityScoringDetail from './activity-scoring-detail'
import ActivityStudents from './activity-students'

export default function ViewActivity({
    activity,
    classroom,
}: {
    activity: GetActivity
    classroom: GetClassroomResponse
}) {
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
                        </AccordionContent>
                    </AccordionItem>
                    {activity.scoring_type != null && (
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="cursor-pointer hover:no-underline text-base pb-2">
                                {activity.grouping_id !== null &&
                                activity.groups ? (
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-lg font-semibold">
                                            Groups
                                        </h2>
                                        <Badge
                                            variant="outline"
                                            className="ml-auto"
                                        >
                                            {activity.groups.length} groups
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-lg font-semibold">
                                            Students
                                        </h2>
                                        <Badge
                                            variant="outline"
                                            className="ml-auto"
                                        >
                                            {activity.students?.length || 0}{' '}
                                            students
                                        </Badge>
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
                <Link
                    href={`/classroom/${classroom.classroom.id}`}
                    className="text-sm opacity-70 cursor-pointer flex items-center mb-2"
                >
                    <ArrowLeft
                        className="inline-block align-middle mr-1"
                        strokeWidth={1.5}
                        size={18}
                    />{' '}
                    Back to {classroom.classroom.name}
                </Link>
                <div className="mb-4">
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
                <QuillEditor
                    initialContent={JSON.parse(activity.description)}
                    readOnly={true}
                    className="mb-4"
                    loadingClassName="min-h-[0px] border-0 justify-start mb-4"
                />
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

                {activity.group && (
                    <>
                        <Separator className="my-4" />

                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-medium">
                                Team: {activity.group.name}
                            </h3>
                        </div>

                        <div className="space-y-2">
                            {activity.group.users.map((user) => (
                                <div className="flex items-center justify-between py-1 rounded-md hover:bg-muted/50">
                                    <div className="flex items-center gap-x-1">
                                        <div className="relative h-6 w-6 cursor-pointer">
                                            <Image
                                                src={user.profile_picture}
                                                alt={
                                                    user.first_name +
                                                    ' ' +
                                                    user.last_name
                                                }
                                                fill
                                                className="rounded-full"
                                            />
                                        </div>
                                        <span className="text-sm">
                                            Eav Long Sok
                                        </span>
                                    </div>
                                    <SimpleToolTip
                                        text="Click to copy email"
                                        sideOffset={5}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                copyToClipboard(user.email)
                                            }
                                        >
                                            {user.email}
                                        </Button>
                                    </SimpleToolTip>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="relative pl-4 gap-y-6 col-span-1 md:col-span-3 h-full">
                {/* TODO fix separator leaving space at the bottom  */}
                <div className="hidden md:block md:absolute left-0 top-[-0.5rem] bottom-0 min-h-[calc(100dvh-4rem)]">
                    <Separator orientation="vertical" className="h-full" />
                </div>

                {renderSidePanel()}
            </div>
        </div>
    )
}
