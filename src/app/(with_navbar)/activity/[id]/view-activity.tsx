'use client'

import QuillEditor from '@/components/quill-editor'
import { SimpleToolTip } from '@/components/simple-tooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/components/ui/file-upload'
import { Separator } from '@/components/ui/separator'
import { copyToClipboard } from '@/lib/utils'
import { UserEssentialDetail } from '@/types/auth'
import type { Activity } from '@/types/classroom'
import { ArrowLeft, FileText, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GetClassroomResponse } from '../../classroom/[id]/actions'

export default function ViewActivity({
    activity,
    classroom,
}: {
    activity: Activity & { posted_by_user: UserEssentialDetail }
    classroom: GetClassroomResponse
}) {
    const router = useRouter()
    const [quill, setQuill] = useState()

    // Find category name if category_id exists
    const categoryName = activity.category_id
        ? classroom.categories.find((cat) => cat.id === activity.category_id)
              ?.name
        : null

    // Find grouping name if grouping_id exists and is not 'individual'
    const groupingName =
        activity.grouping_id && activity.grouping_id !== 'individual'
            ? classroom.groupings.find(
                  (group) => group.id === activity.grouping_id
              )?.name
            : 'Individual'

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="pr-4">
                <Link
                    href={`/classroom/${classroom.classroom.id}/groupings`}
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

                    <p className="text-xs">
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
                    setQuillObject={setQuill}
                    readOnly={true}
                    className="mb-4"
                    loadingClassName="min-h-[0px] border-0 justify-start mb-4"
                />
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activity.files &&
                        activity.files.length > 0 &&
                        // <h2 className="text-lg font-semibold mb-2">
                        //     Attachments
                        // </h2>
                        // <div className="space-y-2">
                        activity.files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm">{file.file_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatBytes(file.file_size)}
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>

                {/* {activity.grouping_id && ( */}
                <>
                    <Separator className="my-4" />

                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">
                            Your Team: __TEAM_NAME__
                        </h3>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-1 rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-x-1">
                                <div className="relative h-6 w-6 cursor-pointer">
                                    <Image
                                        src={
                                            activity.posted_by_user
                                                .profile_picture
                                        }
                                        alt={
                                            activity.posted_by_user.first_name +
                                            ' ' +
                                            activity.posted_by_user.last_name
                                        }
                                        fill
                                        className="rounded-full"
                                    />
                                </div>
                                <span className="text-sm">Eav Long Sok</span>
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
                                        copyToClipboard('esok@paragoniu.edu.kh')
                                    }
                                >
                                    esok@paragoniu.edu.kh
                                </Button>
                            </SimpleToolTip>
                        </div>
                    </div>
                </>
                {/* )} */}
            </div>

            <div className="hidden md:block md:absolute left-1/2 top-0 bottom-0 -ml-px">
                <Separator orientation="vertical" className="h-full" />
            </div>

            <div className="pl-4 space-y-6">
                {activity.scoring_type && (
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
                                            <span className="text-2xl">
                                                100
                                            </span>
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
                )}

                <div>
                    <h2 className="text-lg font-semibold mb-3">Comments</h2>
                    <div className="space-y-4">
                        {/* Comment list - would be mapped from actual comments */}
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {/* Example comment from teacher */}
                            <div className="flex gap-3">
                                <div className="relative h-8 w-8 flex-shrink-0">
                                    <Image
                                        src="/placeholder-avatar.jpg" // Replace with actual avatar
                                        alt="Teacher"
                                        fill
                                        className="rounded-full"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                            Dr. Jane Smith
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Apr 25
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1">
                                        Great work on this assignment! Your
                                        analysis in section 3 was particularly
                                        insightful.
                                    </p>
                                </div>
                            </div>

                            {/* Example comment from student */}
                            <div className="flex gap-3">
                                <div className="relative h-8 w-8 flex-shrink-0">
                                    <Image
                                        src={
                                            activity.posted_by_user
                                                .profile_picture
                                        }
                                        alt="Student"
                                        fill
                                        className="rounded-full"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                            You
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Apr 24
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1">
                                        Thank you for the feedback! I spent
                                        extra time on that section.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Comment input */}
                        <div className="mt-4 flex items-start gap-3">
                            <div className="relative h-8 w-8 flex-shrink-0">
                                <Image
                                    src={
                                        activity.posted_by_user.profile_picture
                                    }
                                    alt="You"
                                    fill
                                    className="rounded-full"
                                />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    className="min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Add a comment..."
                                />
                                <div className="flex justify-end mt-2">
                                    <Button size="sm">Post</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
