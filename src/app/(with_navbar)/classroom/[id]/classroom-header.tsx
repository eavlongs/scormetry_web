'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { colorMap } from '@/types/classroom'
import { ArchiveIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { GetClassroomResponse } from './actions'
import EditClassroomDialog from './edit-classroom-dialog'
import { useState } from 'react'
import DeleteClassroomDialog from './delete-classroom-dialog'

export default function ClassroomHeader({
    classroom,
}: {
    classroom: GetClassroomResponse
}) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
                </div>
            </div>
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
