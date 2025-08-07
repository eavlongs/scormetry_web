'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Activity,
    CLASSROOM_ROLE_TEACHER,
    Classroom,
    ClassroomRole,
} from '@/types/classroom'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { CalendarIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getActivities } from './actions'

export function ActivityCard({
    activity,
    classroom,
    onShowDeleteDialog,
}: {
    activity: NonNullable<
        Awaited<ReturnType<typeof getActivities>>
    >['activities'][0]
    classroom: Classroom & {
        role: ClassroomRole
    }
    onShowDeleteDialog: (activity: Activity) => void
}) {
    const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
        addSuffix: true,
    })

    return (
        <Link
            href={`/activity/${activity.id}`}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b"
        >
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h3 className="font-medium line-clamp-1">
                        {activity.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className="relative h-6 w-6 cursor-pointer">
                            <Image
                                src={activity.posted_by_user.profile_picture}
                                alt={
                                    activity.posted_by_user.first_name +
                                    ' ' +
                                    activity.posted_by_user.last_name
                                }
                                fill
                                className="rounded-full"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {activity.posted_by_user.first_name +
                                ' ' +
                                activity.posted_by_user.last_name}
                        </span>
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                            {timeAgo}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
                {/* <CalendarIcon className="mr-1 h-3 w-3" />
                <span>{timeAgo}</span> */}
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
                            side="left"
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                        >
                            <DropdownMenuItem asChild>
                                <Link href={`/activity/${activity.id}/edit`}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onShowDeleteDialog(activity)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </Link>
    )
}
