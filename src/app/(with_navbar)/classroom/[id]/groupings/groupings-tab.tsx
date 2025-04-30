'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Grouping } from '@/types/classroom'
import { EditIcon, FileTextIcon, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { GetClassroomResponse } from '../actions'
import { CreateGroupingDialog } from './create-grouping-dialog'
import { DeleteGroupingDialog } from './delete-grouping-dialog'
import { EditGroupingDialog } from './edit-grouping-dialog'

export default function GroupingsTab({
    classroom,
}: {
    classroom: GetClassroomResponse
}) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Groupings</h2>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Grouping
                </Button>
            </div>
            <Card className="py-4">
                <CardContent>
                    <GroupingList classroom={classroom} />
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
}: {
    classroom: GetClassroomResponse
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
                    {classroom.groupings.map((grouping) => (
                        <TableRow key={grouping.id}>
                            <TableCell>
                                <Link href={`/grouping/${grouping.id}`}>
                                    {grouping.name}
                                </Link>
                            </TableCell>
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
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            setEditGrouping(grouping)
                                        }
                                    >
                                        <EditIcon className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() =>
                                            setDeleteGrouping(grouping)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
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
