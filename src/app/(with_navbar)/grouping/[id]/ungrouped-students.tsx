'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { UserEssentialDetail } from '@/types/auth'
import { UserPlus } from 'lucide-react'
import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import { GetGroupingDetailResponse } from './actions'

interface UngroupedStudentsProps {
    students: UserEssentialDetail[]
    groups: GetGroupingDetailResponse['groups']
    onMoveStudent: (studentId: string, toGroupId: string) => void
    onRemoveStudentFromGroup: (
        studentId: string,
        fromGroupId: string | null
    ) => void
}

export default function UngroupedStudents({
    students,
    groups,
    onMoveStudent,
    onRemoveStudentFromGroup,
}: UngroupedStudentsProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [{ isOver }, drop] = useDrop({
        accept: 'STUDENT',
        drop: (item: { id: string; fromGroupId: string | null }) => {
            onRemoveStudentFromGroup(item.id, item.fromGroupId)
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    })

    drop(ref)

    return (
        <Card
            className={cn(
                'transition-colors h-full flex flex-col p-6 gap-0',
                isOver ? 'border-primary bg-accent/20' : ''
            )}
            ref={ref}
        >
            <CardHeader className="px-0 pb-0">
                <CardTitle>Ungrouped Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-grow overflow-hidden px-0">
                <ul
                    className={cn(
                        'flex flex-col gap-y-1 h-full overflow-y-auto',
                        students.length == 0 ? 'justify-center' : ''
                    )}
                >
                    {students.length === 0 ? (
                        <li className="text-xs text-center text-muted-foreground lg:mt-0">
                            All students have been assigned to groups
                        </li>
                    ) : (
                        students.map((student) => (
                            <StudentItem
                                key={student.id}
                                student={student}
                                groups={groups}
                                onMoveToGroup={(groupId) =>
                                    onMoveStudent(student.id, groupId)
                                }
                            />
                        ))
                    )}
                </ul>
            </CardContent>
        </Card>
    )
}

interface StudentItemProps {
    student: UserEssentialDetail
    groups: GetGroupingDetailResponse['groups']
    onMoveToGroup: (groupId: string) => void
}

function StudentItem({ student, groups, onMoveToGroup }: StudentItemProps) {
    const [{ isDragging }, drag] = useDrag({
        type: 'STUDENT',
        item: { id: student.id, fromGroupId: null },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    return drag(
        <li
            className={cn(
                'py-2 rounded flex justify-between items-center px-1',
                isDragging ? 'opacity-40' : '',
                'cursor-move hover:bg-accent text-xs'
            )}
        >
            <span className="truncate">
                {student.first_name + ' ' + student.last_name}
            </span>

            {groups.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                        >
                            <UserPlus className="h-3 w-3" />
                            <span className="sr-only">Add to group</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {groups.map((group) => (
                            <DropdownMenuItem
                                key={group.id}
                                onClick={() => onMoveToGroup(group.id)}
                            >
                                Add to {group.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </li>
    )
}
