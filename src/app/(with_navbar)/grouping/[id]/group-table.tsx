'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GroupNameSchema } from '@/schema'
import type { UserEssentialDetail } from '@/types/auth'
import { Prettify } from '@/types/general'
import { Check, Edit, EllipsisVertical, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { toast } from 'sonner'
import { ZodError } from 'zod'
import { GetGroupingDetailResponse } from './actions'

export default function GroupTable({
    group,
    onRename,
    onDelete,
    onMoveStudent,
    setGroupToDelete,
}: {
    group: Prettify<GetGroupingDetailResponse['groups'][number]>
    onRename: (groupId: string, newName: string) => void
    onDelete: (groupId: string) => void
    onMoveStudent: (
        studentId: string,
        fromGroupId: string,
        toGroupId: string | null
    ) => void
    setGroupToDelete: React.Dispatch<React.SetStateAction<typeof group | null>>
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(group.name)
    const ref = useRef<HTMLDivElement>(null)

    const [{ isOver }, drop] = useDrop({
        accept: 'STUDENT',
        drop: (item: { id: string; fromGroupId: string | null }) => {
            if (item.fromGroupId !== group.id) {
                onMoveStudent(item.id, item.fromGroupId as string, group.id)
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    })

    const handleRename = () => {
        try {
            const groupName = GroupNameSchema.parse(editedName)
            onRename(group.id, groupName.trim())
            setIsEditing(false)
        } catch (e) {
            if (e instanceof ZodError) {
                toast.error(e.issues[0].message)
                return
            }
            toast.error('Something went wrong. Please try again.')
        }
    }

    const handleCancelEdit = () => {
        setEditedName(group.name)
        setIsEditing(false)
    }

    drop(ref)

    return (
        <Card
            ref={ref}
            className={cn(
                `transition-colors border h-full flex flex-col py-0 gap-0`,
                isOver ? 'border-primary bg-accent/20' : ''
            )}
        >
            <CardHeader className="p-2 gap-y-0 relative flex items-center justify-center">
                <div className="flex items-center gap-1 min-w-0">
                    {isEditing ? (
                        <div className="flex gap-1 items-center  min-w-0">
                            <Input
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="h-7 text-sm"
                                autoFocus
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleRename}
                                className="h-6 w-6 shrink-0"
                            >
                                <Check className="h-3 w-3" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-6 w-6 shrink-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                                {group.name}
                            </h3>
                            {/* <span className="text-xs text-muted-foreground whitespace-nowrap">
                                ({group.students.length})
                            </span> */}
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 absolute right-2"
                            >
                                <EllipsisVertical className="h-3 w-3" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Rename Group
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (group.users.length > 0) {
                                        setGroupToDelete(group)
                                    } else {
                                        onDelete(group.id)
                                    }
                                }}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete Group
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>

            <CardContent className="px-2 pb-2 pt-0 flex-grow overflow-hidden">
                <div className="border-t pt-1 mt-1">
                    <ul className="space-y-1 overflow-y-auto max-h-[120px]">
                        {group.users.length === 0 ? (
                            <li className="text-xs text-center py-2 text-muted-foreground">
                                Drag students here
                            </li>
                        ) : (
                            group.users.map((student) => (
                                <StudentItem
                                    key={student.id}
                                    student={student}
                                    groupId={group.id}
                                    onRemove={() =>
                                        onMoveStudent(
                                            student.id,
                                            group.id,
                                            null
                                        )
                                    }
                                />
                            ))
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}

interface StudentItemProps {
    student: UserEssentialDetail
    groupId: string
    onRemove: () => void
}

function StudentItem({ student, groupId, onRemove }: StudentItemProps) {
    const [{ isDragging }, drag] = useDrag({
        type: 'STUDENT',
        item: { id: student.id, fromGroupId: groupId },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    return drag(
        <li
            className={`flex items-center justify-between py-1 px-2 rounded text-xs ${
                isDragging ? 'opacity-40' : ''
            } cursor-move hover:bg-accent`}
        >
            <span className="truncate">
                {student.first_name + ' ' + student.last_name}
            </span>
            <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                title="Remove from group"
                className="h-5 w-5 ml-1 shrink-0"
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </li>
    )
}
