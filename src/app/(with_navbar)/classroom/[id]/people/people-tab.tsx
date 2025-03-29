'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import useSession from '@/hooks/useSession'
import { ClassroomUserDetail } from '@/types/auth'
import {
    CLASSROOM_ROLE_JUDGE,
    CLASSROOM_ROLE_STUDENT,
    CLASSROOM_ROLE_TEACHER,
    ClassroomRole,
} from '@/types/classroom'
import { Trash2, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { GetClassroomResponse } from '../actions'
import DeleteClassroomUserDialog from './delete-classroom-user-dialog'
import { InviteUsersToClassroomDialog } from './invite-users-to-classroom-dialog'

export default function PeopleTab({
    classroom,
}: {
    classroom: GetClassroomResponse
}) {
    const owner = classroom.people.owner
    const teachers = classroom.people.teachers
    const judges = classroom.people.judges
    const students = classroom.people.students
    const [userToDelete, setUserToDelete] =
        useState<ClassroomUserDetail | null>(null)
    const session = useSession()
    const [inviteUserDialogRole, setInviteUserDialogRole] =
        useState<ClassroomRole | null>(null)

    return (
        <Card>
            {/* <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>People</CardTitle>
                        <CardDescription>
                            Manage teachers, judges, and students
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">

                        <Button
                            variant="outline"
                            onClick={() => handleOpenDialog('Judge')}
                        >
                            <MailPlus className="mr-2 h-4 w-4" />
                            Invite Judges
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleOpenDialog('Student')}
                        >
                            <MailPlus className="mr-2 h-4 w-4" />
                            Invite Students
                        </Button>
                    </div>
                </div>

                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search people..." className="pl-8" />
                </div>
            </CardHeader> */}

            <CardContent className="space-y-6">
                <section>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold mb-2">
                            Teachers ({teachers.length + 1}){' '}
                            {/* +1 for owner */}
                        </h3>
                        {classroom.role == CLASSROOM_ROLE_TEACHER && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setInviteUserDialogRole(
                                        CLASSROOM_ROLE_TEACHER
                                    )
                                }
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <PersonRow
                            person={owner}
                            showDeleteButton={false}
                            setUserToDelete={setUserToDelete}
                        />
                        {teachers.length > 0
                            ? teachers.map((teacher) => (
                                  <PersonRow
                                      key={teacher.id || teacher.email}
                                      person={teacher}
                                      showDeleteButton={
                                          session.user
                                              ? session.user.id ==
                                                classroom.classroom.owned_by
                                              : false
                                      }
                                      setUserToDelete={setUserToDelete}
                                  />
                              ))
                            : null}
                    </div>
                </section>

                <Separator />

                <section>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold mb-2">
                            Judges ({judges.length})
                        </h3>
                        {classroom.role == CLASSROOM_ROLE_TEACHER && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setInviteUserDialogRole(
                                        CLASSROOM_ROLE_JUDGE
                                    )
                                }
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {judges.length > 0 ? (
                            judges.map((judge) => (
                                <PersonRow
                                    key={judge.id || judge.email}
                                    person={judge}
                                    showDeleteButton={
                                        classroom.role == CLASSROOM_ROLE_TEACHER
                                    }
                                    setUserToDelete={setUserToDelete}
                                />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm py-2">
                                No judges assigned
                            </p>
                        )}
                    </div>
                </section>

                <Separator />

                <section>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold mb-2">
                            Students ({students.length})
                        </h3>
                        {classroom.role == CLASSROOM_ROLE_TEACHER && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setInviteUserDialogRole(
                                        CLASSROOM_ROLE_STUDENT
                                    )
                                }
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <PersonRow
                                    key={student.id || student.email}
                                    person={student}
                                    showDeleteButton={
                                        classroom.role == CLASSROOM_ROLE_TEACHER
                                    }
                                    setUserToDelete={setUserToDelete}
                                />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm py-2">
                                No students enrolled
                            </p>
                        )}
                    </div>
                </section>
            </CardContent>

            <InviteUsersToClassroomDialog
                classroom={classroom}
                roleOfUserToInvite={inviteUserDialogRole}
                setRoleOfUserToInvite={setInviteUserDialogRole}
            />

            <DeleteClassroomUserDialog
                classroom={classroom}
                user={userToDelete}
                setUser={setUserToDelete}
            />
        </Card>
    )
}

function PersonRow({
    person,
    showDeleteButton,
    setUserToDelete,
}: {
    person: ClassroomUserDetail
    showDeleteButton: boolean
    setUserToDelete: React.Dispatch<
        React.SetStateAction<ClassroomUserDetail | null>
    >
}) {
    // If the person only has an email (invited but not registered)
    const isInvited = !person.first_name

    return (
        <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-3">
                {isInvited ? (
                    <Avatar>
                        <AvatarFallback>
                            {person.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <div className="relative h-8 w-8">
                        <Image
                            src={person.profile_picture!}
                            alt={person.first_name + ' ' + person.last_name}
                            fill
                            className="rounded-full"
                        />
                    </div>
                )}

                <div>
                    {isInvited ? (
                        <div className="flex items-center">
                            <span className="font-medium">{person.email}</span>
                            <span className="ml-2 rounded-2xl bg-paragon text-white px-2 py-1 text-xs">
                                Invited
                            </span>
                        </div>
                    ) : (
                        <>
                            <p className="font-medium">
                                {person.first_name + ' ' + person.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {person.email}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {showDeleteButton && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => setUserToDelete(person)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove user</span>
                </Button>
            )}
        </div>
    )
}
