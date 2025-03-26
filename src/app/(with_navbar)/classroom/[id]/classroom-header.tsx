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
import { cn } from '@/lib/utils'
import { colorMap } from '@/types/classroom'
import {
    ArchiveIcon,
    Copy,
    Link2,
    MoreVertical,
    Pencil,
    RefreshCw,
    Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse, regenerateClassroomCode } from './actions'
import DeleteClassroomDialog from './delete-classroom-dialog'
import EditClassroomDialog from './edit-classroom-dialog'

export default function ClassroomHeader({
    classroom,
    tab,
}: {
    classroom: GetClassroomResponse
    tab: 'activities' | 'people' | 'grades'
}) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isRegeneratingCode, setIsRegeneratingCode] = useState(false)

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(classroom.classroom.code)
            toast.success('Code copied to clipboard')
        } catch (err) {
            toast.error('Failed to copy')
        }
    }

    async function copyLink() {
        try {
            const hostname = window.location.hostname
            const port = window.location.port
            const path = `/code/${classroom.classroom.code}`

            let url = ''
            if (port != '80' && port != '443') {
                url = `${hostname}:${port}${path}`
            } else {
                url = `${hostname}${path}`
            }

            await navigator.clipboard.writeText(url)
            toast.success('Link copied to clipboard')
        } catch (err) {
            toast.error('Failed to copy')
        }
    }

    async function handleRegenerateClassroomCode() {
        setIsRegeneratingCode(true)

        const response = await regenerateClassroomCode(classroom.classroom.id)

        if (response.success && response.data) {
            classroom.classroom.code = response.data.code
        } else {
            toast.error(response.message)
        }

        setIsRegeneratingCode(false)
    }

    return (
        <>
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback
                            className={cn(
                                'text-white px-2 py-1',
                                colorMap[classroom.classroom.color]
                            )}
                        >
                            {classroom.classroom.name[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-xl font-bold">
                        {classroom.classroom.name}
                    </h1>

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
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-3 text-sm ml-auto">
                        <div className="flex items-center bg-muted/30 border rounded-md px-3 py-1.5 hover:bg-muted/50 transition-colors">
                            <span className="text-muted-foreground mr-2">
                                Code:
                            </span>
                            <span className="font-mono font-medium">
                                {classroom.classroom.code}
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
                                    <span className="sr-only">
                                        Copy join code
                                    </span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 rounded-full hover:bg-background"
                                    onClick={copyLink}
                                    title="Copy link"
                                >
                                    <Link2 className="h-3.5 w-3.5" />
                                    <span className="sr-only">
                                        Copy join link
                                    </span>
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
                                    <span className="sr-only">
                                        Regenerate code
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={tab}>
                <TabsList className="grid grid-cols-3 mt-2">
                    <TabsTrigger value="activities" asChild>
                        <Link href={`/classroom/${classroom.classroom.id}`}>
                            Activities
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="people">
                        <Link
                            href={`/classroom/${classroom.classroom.id}/people`}
                        >
                            People
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="grades">
                        <Link
                            href={`/classroom/${classroom.classroom.id}/grades`}
                        >
                            Grades
                        </Link>
                    </TabsTrigger>
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
        </>
    )
}
