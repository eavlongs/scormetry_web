'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import { Grouping } from '@/types/classroom'
import { EditIcon, Eye, FileTextIcon, Info, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { GetClassroomResponse } from '../actions'
import { CreateGroupingDialog } from './create-grouping-dialog'
import { DeleteGroupingDialog } from './delete-grouping-dialog'
import { EditGroupingDialog } from './edit-grouping-dialog'

export default function GroupingsTab({
    classroom,
    groupings,
}: {
    classroom: GetClassroomResponse
    groupings: Grouping[]
}) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const isMobile = useIsMobile()
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-x-2">
                    Groupings
                    <Popover>
                        <PopoverTrigger>
                            <Info className="h-4 w-4 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent
                            className="text-xs px-4 py-2 border-black text-justify"
                            align="center"
                            side={isMobile ? 'bottom' : 'right'}
                        >
                            Grouping lets you split users into smaller teams.
                            You can create groups and assign members for each
                            group. This allows you to score students on a
                            group-by-group basis.
                        </PopoverContent>
                    </Popover>
                </h2>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Grouping
                </Button>
            </div>
            <Card className="py-4">
                <CardContent>
                    <GroupingList classroom={classroom} groupings={groupings} />
                </CardContent>

                <CreateGroupingDialog
                    open={isCreateDialogOpen}
                    setOpen={setIsCreateDialogOpen}
                    classroom={classroom}
                />
            </Card>
        </>
    )
}

export function GroupingList({
    classroom,
    groupings,
}: {
    classroom: GetClassroomResponse
    groupings: Grouping[]
}) {
    const [editGrouping, setEditGrouping] = useState<Grouping | null>(null)
    const [deleteGrouping, setDeleteGrouping] = useState<Grouping | null>(null)

    if (classroom.groupings.length === 0) {
        return (
            <div className="text-center p-8">
                <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No groupings yet</h3>
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[150px] text-center">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupings.map((grouping) => (
                        <TableRow key={grouping.id}>
                            <TableCell>{grouping.name}</TableCell>
                            <TableCell className="overflow-hidden whitespace-nowrap overflow-ellipsis">
                                {grouping.description ? (
                                    grouping.description
                                ) : (
                                    <span className="opacity-50">
                                        No description
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="flex justify-center">
                                <div className="flex items-center gap-2">
                                    <SimpleToolTip text="View Groups">
                                        <Link href={`/grouping/${grouping.id}`}>
                                            <Button size="sm" variant="ghost">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">
                                                    View Groups
                                                </span>
                                            </Button>
                                        </Link>
                                    </SimpleToolTip>
                                    <SimpleToolTip text="Edit Grouping Name and Description">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setEditGrouping(grouping)
                                            }
                                        >
                                            <EditIcon className="h-4 w-4" />
                                            <span className="sr-only">
                                                Edit Grouping Name and
                                                Description
                                            </span>
                                        </Button>
                                    </SimpleToolTip>
                                    <SimpleToolTip text="Delete Grouping">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() =>
                                                setDeleteGrouping(grouping)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">
                                                Delete
                                            </span>
                                        </Button>
                                    </SimpleToolTip>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <EditGroupingDialog
                classroom={classroom}
                grouping={editGrouping}
                setGrouping={setEditGrouping}
            />

            <DeleteGroupingDialog
                classroom={classroom}
                grouping={deleteGrouping}
                setGrouping={setDeleteGrouping}
            />
        </>
    )
}
