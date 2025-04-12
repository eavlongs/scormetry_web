'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { UserEssentialDetail } from '@/types/auth'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { GetGroupingDetailResponse } from './actions'
import GroupTable from './group-table'
import UngroupedStudents from './ungrouped-students'

export default function Grouping({
    groupingDetail,
}: {
    groupingDetail: GetGroupingDetailResponse
}) {
    const [grouping, _] = useState<typeof groupingDetail.grouping>(
        structuredClone(groupingDetail.grouping)
    )
    const [groups, setGroups] = useState<typeof groupingDetail.groups>(
        structuredClone(groupingDetail.groups)
    )
    const [ungroupedStudents, setUngroupedStudents] = useState<
        typeof groupingDetail.available_students
    >(structuredClone(groupingDetail.available_students))

    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')

    const handleCreateGroup = () => {
        if (newGroupName.trim()) {
            const newGroup: (typeof groupingDetail.groups)[number] = {
                id: `group-${new Date().getTime()}`,
                name: newGroupName,
                grouping_id: grouping.id,
                students: [],
            }
            setGroups([...groups, newGroup])
            setNewGroupName('')
            setIsCreateGroupOpen(false)
        }
    }

    const handleRenameGroup = (groupId: string, newName: string) => {
        setGroups(
            groups.map((group) =>
                group.id === groupId ? { ...group, name: newName } : group
            )
        )
    }

    const handleDeleteGroup = (groupId: string) => {
        const groupToDelete = groups.find((g) => g.id === groupId)
        if (groupToDelete) {
            setUngroupedStudents([
                ...ungroupedStudents,
                ...groupToDelete.students,
            ])
            setGroups(groups.filter((group) => group.id !== groupId))
        }
    }

    const handleMoveStudent = (
        studentId: string,
        fromGroupId: string | null,
        toGroupId: string | null
    ) => {
        // Get the student object
        let student: UserEssentialDetail | undefined

        if (fromGroupId === null) {
            // Moving from ungrouped list
            student = ungroupedStudents.find((s) => s.id === studentId)
            if (student) {
                setUngroupedStudents(
                    ungroupedStudents.filter((s) => s.id !== studentId)
                )
            }
        } else {
            // Moving from a group
            const fromGroup = groups.find((g) => g.id === fromGroupId)
            if (fromGroup) {
                student = fromGroup.students.find((s) => s.id === studentId)
                setGroups((prev) =>
                    prev.map((group) =>
                        group.id === fromGroupId
                            ? {
                                  ...group,
                                  students: group.students.filter(
                                      (s) => s.id !== studentId
                                  ),
                              }
                            : group
                    )
                )
            }
        }

        if (!student) return

        if (toGroupId === null) {
            // Moving to ungrouped list
            setUngroupedStudents([...ungroupedStudents, student])
        } else {
            // Moving to a group
            setGroups((prev) =>
                prev.map((group) =>
                    group.id === toGroupId
                        ? { ...group, students: [...group.students, student] }
                        : group
                )
            )
        }
    }

    const handleSaveChanges = () => {
        // In a real application, this would send the data to the server
        console.log('Saving changes:', { groups, ungroupedStudents })
        // You could implement a server action here
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="w-full h-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <Link
                        href={`/classroom/${groupingDetail.classroom.id}/groupings`}
                        className="text-sm opacity-70 cursor-pointer flex items-center"
                    >
                        <ArrowLeft
                            className="inline-block align-middle mr-1"
                            strokeWidth={1.5}
                            size={18}
                        />{' '}
                        Back to {groupingDetail.classroom.name}
                    </Link>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            onClick={() => setIsCreateGroupOpen(true)}
                            className="flex items-center gap-2 flex-1 sm:flex-none"
                        >
                            <Plus className="h-4 w-4" />
                            Create Group
                        </Button>
                        <Button
                            onClick={handleSaveChanges}
                            className="flex items-center gap-2 flex-1 sm:flex-none bg-green-500"
                        >
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                    <div className="lg:col-span-7 overflow-auto pr-2">
                        <h2 className="text-lg font-medium mb-3 bg-background pb-2">
                            Grouping: {groupingDetail.grouping.name}
                        </h2>
                        {groups.length === 0 ? (
                            <div className="text-center p-4 h-[250px] flex flex-col items-center justify-center gap-y-4">
                                <p>
                                    No groups created yet. Create a group to get
                                    started.
                                </p>
                                <Button
                                    onClick={() => setIsCreateGroupOpen(true)}
                                    className="flex items-center gap-2 flex-1 sm:flex-none"
                                >
                                    Create Group
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {groups.map((group) => (
                                    <GroupTable
                                        key={group.id}
                                        group={group}
                                        onRename={handleRenameGroup}
                                        onDelete={handleDeleteGroup}
                                        onMoveStudent={handleMoveStudent}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* TODO: make this absolute positioned */}
                    <div className="h-full flex flex-col min-h-[250px] lg:min-h-[80dvh] lg:col-span-3">
                        {/* <h2 className="text-lg font-semibold mb-3 sticky top-0 bg-background z-10">
                            Ungrouped Students
                        </h2> */}
                        <div className="flex-grow">
                            <UngroupedStudents
                                students={ungroupedStudents}
                                onMoveStudent={(
                                    studentId: string,
                                    toGroupId: string
                                ) =>
                                    handleMoveStudent(
                                        studentId,
                                        null,
                                        toGroupId
                                    )
                                }
                                onRemoveStudentFromGroup={(
                                    studentId: string,
                                    fromGroupId: string | null
                                ) => {
                                    if (!fromGroupId) return
                                    handleMoveStudent(
                                        studentId,
                                        fromGroupId,
                                        null
                                    )
                                }}
                                groups={groups}
                            />
                        </div>
                    </div>
                </div>

                <Dialog
                    open={isCreateGroupOpen}
                    onOpenChange={setIsCreateGroupOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Group</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="Enter group name"
                                value={newGroupName}
                                onChange={(e) =>
                                    setNewGroupName(e.target.value)
                                }
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateGroupOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreateGroup}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DndProvider>
    )
}
