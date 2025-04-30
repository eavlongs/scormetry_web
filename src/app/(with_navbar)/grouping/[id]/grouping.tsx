'use client'

import { Button } from '@/components/ui/button'
import { useWarnIfUnsavedChanges } from '@/hooks/useWarnIfUnsavedChanges'
import type { UserEssentialDetail } from '@/types/auth'
import { SP_AFTER_SAVE_KEY, SP_DATA_KEY } from '@/types/general'
import ld from 'lodash'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { toast } from 'sonner'
import { GetGroupingDetailResponse, saveGroupingComposition } from './actions'
import { CreateGroupDialog } from './create-group-dialog'
import { DeleteGroupDialog } from './delete-group-dialog'
import GroupTable from './group-table'
import UngroupedStudents from './ungrouped-students'

export default function Grouping({
    groupingDetail,
}: {
    groupingDetail: Readonly<GetGroupingDetailResponse>
}) {
    const [originalData, _setOriginalData] = useState<typeof groupingDetail>(
        structuredClone(groupingDetail)
    )
    const [grouping] = useState<typeof groupingDetail.grouping>(
        structuredClone(groupingDetail.grouping)
    )
    const [classroom] = useState<typeof groupingDetail.classroom>(
        structuredClone(groupingDetail.classroom)
    )
    const [groups, setGroups] = useState<typeof groupingDetail.groups>(
        structuredClone(groupingDetail.groups)
    )
    const [ungroupedStudents, setUngroupedStudents] = useState<
        typeof groupingDetail.available_students
    >(structuredClone(groupingDetail.available_students))

    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [discardingChange, setDiscardingChange] = useState(false)
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
    const [groupToDelete, setGroupToDelete] = useState<
        GetGroupingDetailResponse['groups'][number] | null
    >(null)

    const [hasDataChanged, setHasDataChanged] = useState(false)
    const searchParams = useSearchParams()

    useWarnIfUnsavedChanges(hasDataChanged, `/grouping/${grouping.id}`)

    useEffect(() => {
        const changed = !ld.isEqual(originalData, {
            grouping,
            groups,
            available_students: ungroupedStudents,
            classroom,
        })
        setHasDataChanged(changed)
    }, [groups, ungroupedStudents, classroom, grouping, originalData])

    function handleRenameGroup(groupId: string, newName: string) {
        setGroups(
            groups.map((group) =>
                group.id === groupId ? { ...group, name: newName } : group
            )
        )
    }

    function handleDeleteGroup(groupId: string) {
        const groupToDelete = groups.find((g) => g.id === groupId)
        if (groupToDelete) {
            setGroupToDelete(null)
            setUngroupedStudents([...ungroupedStudents, ...groupToDelete.users])
            setGroups(groups.filter((group) => group.id !== groupId))
        }
    }

    function handleMoveStudent(
        studentId: string,
        fromGroupId: string | null,
        toGroupId: string | null
    ) {
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
                student = fromGroup.users.find((s) => s.id === studentId)
                setGroups((prev) =>
                    prev.map((group) =>
                        group.id === fromGroupId
                            ? {
                                  ...group,
                                  users: group.users.filter(
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
                        ? { ...group, users: [...group.users, student] }
                        : group
                )
            )
        }
    }

    function handleDiscardChange() {
        setDiscardingChange(true)
        setGroups(structuredClone(originalData.groups))
        setUngroupedStudents(structuredClone(originalData.available_students))
        setDiscardingChange(false)
    }

    async function handleSaveChanges() {
        setSaving(true)
        const groupsCheckpoint = structuredClone(groups)
        const ungroupedStudentsCheckpoint = structuredClone(ungroupedStudents)
        const respones = await saveGroupingComposition(grouping.id, groups)

        if (respones.success) {
            toast.success('Changes saved successfully')
            // this is to make sure that the "save change" button is disabled, and user can navigate to other pages
            _setOriginalData((prev) => {
                return {
                    ...prev,
                    groups: groupsCheckpoint,
                    available_students: ungroupedStudentsCheckpoint,
                }
            })
            console.log(searchParams.keys)
            if (!searchParams.has(SP_AFTER_SAVE_KEY)) return

            const redirectAfterSave = searchParams.get(SP_AFTER_SAVE_KEY)
            if (!redirectAfterSave) return

            let url = redirectAfterSave
            const urlSearchParams = new URLSearchParams()

            if (searchParams.has(SP_DATA_KEY)) {
                const dataKey = searchParams.get(SP_DATA_KEY)

                if (dataKey) {
                    urlSearchParams.append(SP_DATA_KEY, dataKey)
                }
            }

            if (searchParams.keys.length > 0) {
                url += '?' + urlSearchParams.toString()
            }

            router.push(url)
        } else {
            toast.error(respones.message)
            setSaving(false)
        }
    }

    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <div className="w-full h-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <Link
                            href={`/classroom/${classroom.id}/groupings`}
                            className="text-sm opacity-70 cursor-pointer flex items-center"
                        >
                            <ArrowLeft
                                className="inline-block align-middle mr-1"
                                strokeWidth={1.5}
                                size={18}
                            />{' '}
                            Back to {classroom.name}
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
                                onClick={handleDiscardChange}
                                variant="destructive"
                                className="flex items-center gap-2 flex-1 sm:flex-none"
                                disabled={
                                    discardingChange ||
                                    !hasDataChanged ||
                                    saving
                                }
                            >
                                <Save className="h-4 w-4" />
                                Discard Change
                            </Button>
                            <Button
                                onClick={handleSaveChanges}
                                className="flex items-center gap-2 flex-1 sm:flex-none bg-green-600 hover:bg-green-500 hover:text-gray-100"
                                disabled={
                                    saving ||
                                    !hasDataChanged ||
                                    discardingChange
                                }
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                        <div className="lg:col-span-7 overflow-auto pr-2">
                            <h2 className="text-lg font-medium mb-3 bg-background pb-2">
                                Grouping: {grouping.name}
                            </h2>
                            {groups.length === 0 ? (
                                <div className="text-center p-4 h-[250px] flex flex-col items-center justify-center gap-y-4">
                                    <p>
                                        No groups created yet. Create a group to
                                        get started.
                                    </p>
                                    <Button
                                        onClick={() =>
                                            setIsCreateGroupOpen(true)
                                        }
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
                                            setGroupToDelete={setGroupToDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* TODO: make this position absolute, and scrollable */}
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
                </div>
            </DndProvider>

            <CreateGroupDialog
                grouping_id={grouping.id}
                isOpen={isCreateGroupOpen}
                setOpen={setIsCreateGroupOpen}
                onCreateGroup={(group) => setGroups([...groups, group])}
            />
            <DeleteGroupDialog
                group={groupToDelete}
                setGroup={setGroupToDelete}
                onDelete={handleDeleteGroup}
            />
        </>
    )
}
