'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useSession from '@/hooks/useSession'
import { cn, copyUrlToClipboard } from '@/lib/utils'
import { Classroom, colorMap } from '@/types/classroom'
import {
    ArchiveIcon,
    Copy,
    Link2,
    LogOut,
    MoreVertical,
    Pencil,
    RefreshCw,
    Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { regenerateClassroomCode } from './actions'
import DeleteClassroomDialog from './delete-classroom-dialog'
import EditClassroomDialog from './edit-classroom-dialog'
import LeaveClassroomDialog from './leave-classroom-dialog'

export default function ClassroomHeader({
    classroom,
    tab,
}: {
    classroom: Classroom
    tab: 'activities' | 'people' | 'grades' | 'categories' | 'groupings'
}) {
    const session = useSession()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isRegeneratingCode, setIsRegeneratingCode] = useState(false)
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)

    const tabs = [
        {
            name: 'Activities',
            value: 'activities',
            href: `/classroom/${classroom.id}`,
        },
        {
            name: 'People',
            value: 'people',
            href: `/classroom/${classroom.id}/people`,
        },
        {
            name: 'Grades',
            value: 'grades',
            href: `/classroom/${classroom.id}/grades`,
        },
        {
            name: 'Categories',
            value: 'categories',
            href: `/classroom/${classroom.id}/categories`,
        },
        {
            name: 'Groupings',
            value: 'groupings',
            href: `/classroom/${classroom.id}/groupings`,
        },
    ]

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(classroom.code)
            toast.success('Code copied to clipboard')
        } catch (err) {
            toast.error('Failed to copy')
        }
    }

    async function copyLink() {
        const path = `/code/${classroom.code}`

        await copyUrlToClipboard(path)
    }

    async function handleRegenerateClassroomCode() {
        setIsRegeneratingCode(true)

        const response = await regenerateClassroomCode(classroom.id)

        if (response.success && response.data) {
            classroom.code = response.data.code
        } else {
            toast.error(response.message)
        }

        setIsRegeneratingCode(false)
    }

    return (
        <>
            <div className="flex items-center justify-center flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback
                            className={cn(
                                'text-white px-2 py-1',
                                colorMap[classroom.color]
                            )}
                        >
                            {classroom.name[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-xl font-bold">{classroom.name}</h1>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-1 cursor-pointer"
                            >
                                <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() => setIsEditDialogOpen(true)}
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <ArchiveIcon className="h-4 w-4 mr-2" />
                                <span>Archive</span>
                            </DropdownMenuItem>
                            {classroom.owned_by !== session.user?.id && (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setIsLeaveDialogOpen(true)}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <span>Leave</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 text-sm ml-0 sm:ml-auto mb-4 sm:mb-0">
                    <div className="flex items-center bg-muted/30 border rounded-md px-3 py-1.5 hover:bg-muted/50 transition-colors">
                        <span className="text-muted-foreground mr-2">
                            Code:
                        </span>
                        <span className="font-mono font-medium">
                            {classroom.code}
                        </span>
                        <div className="flex items-center ml-3 border-l pl-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 rounded-full hover:bg-background"
                                onClick={copyCode}
                                title="Copy code"
                            >
                                <Copy className="h-3.5 w-3.5" />
                                <span className="sr-only">Copy join code</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 rounded-full hover:bg-background"
                                onClick={copyLink}
                                title="Copy link"
                            >
                                <Link2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Copy join link</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 rounded-full hover:bg-background ml-1"
                                onClick={handleRegenerateClassroomCode}
                                disabled={isRegeneratingCode}
                                title="Regenerate code"
                            >
                                <RefreshCw
                                    className={cn(
                                        'h-3.5 w-3.5',
                                        isRegeneratingCode && 'animate-spin'
                                    )}
                                />
                                <span className="sr-only">Regenerate code</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={tab}>
                <TabsList className="grid grid-cols-5 mt-2">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} asChild>
                            <Link href={tab.href} className="px-4">
                                {tab.name}
                            </Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <EditClassroomDialog
                classroom={classroom}
                open={isEditDialogOpen}
                setOpen={setIsEditDialogOpen}
            />

            <DeleteClassroomDialog
                classroom={classroom}
                open={isDeleteDialogOpen}
                setOpen={setIsDeleteDialogOpen}
            />

            {classroom.owned_by != session.user?.id && (
                <LeaveClassroomDialog
                    classroom={classroom}
                    open={isLeaveDialogOpen}
                    setOpen={setIsLeaveDialogOpen}
                />
            )}
        </>
    )
}
