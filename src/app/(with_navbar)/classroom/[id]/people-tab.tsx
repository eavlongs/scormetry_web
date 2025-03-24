'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ClassroomUserDetail } from '@/types/auth'
import {
    CLASSROOM_ROLE_JUDGE,
    CLASSROOM_ROLE_STUDENT,
    CLASSROOM_ROLE_TEACHER,
    ClassroomRole,
} from '@/types/classroom'
import { UserPlus } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { GetClassroomResponse } from './actions'

export default function PeopleTab({
    classroom,
}: {
    classroom: GetClassroomResponse
}) {
    const owner = classroom.people.owner
    const teachers = classroom.people.teachers
    const judges = classroom.people.judges
    const students = classroom.people.students

    const [inviteRole, setInviteRole] = useState<ClassroomRole>(
        CLASSROOM_ROLE_STUDENT
    )
    const [emailTags, setEmailTags] = useState<string[]>([])
    const [currentInput, setCurrentInput] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [invalidEmails, setInvalidEmails] = useState<string[]>([])
    const [validationError, setValidationError] = useState('') // New state for validation errors

    // Email validation regex
    const validateEmail = (email: string) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(email).toLowerCase())
    }

    // Function to check if email is already in the classroom
    const isEmailInClassroom = (email: string) => {
        const allEmails = [
            ...teachers.map((t) => t.email),
            ...judges.map((j) => j.email),
            ...students.map((s) => s.email),
        ]
        return allEmails.includes(email)
    }

    const handleOpenDialog = (role: ClassroomRole) => {
        setInviteRole(role)
        setEmailTags([])
        setInvalidEmails([])
        setValidationError('') // Clear validation errors
        setIsDialogOpen(true)
    }

    const addEmailTag = (email: string) => {
        email = email.trim()

        // Clear previous validation errors
        setValidationError('')

        // Don't add empty emails
        if (!email) return

        // Check if email is valid using regex
        if (!validateEmail(email)) {
            setValidationError(`"${email}" is not a valid email address`)
            return
        }

        // Check if email is already added as a tag
        if (emailTags.includes(email)) {
            setValidationError(`"${email}" has already been added`)
            return
        }

        // Add valid email as a tag
        setEmailTags([...emailTags, email])
        setCurrentInput('')
    }

    const removeEmailTag = (indexToRemove: number) => {
        setEmailTags(emailTags.filter((_, index) => index !== indexToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Add tag when space, comma, or Enter is pressed
        if ([' ', ',', 'Enter'].includes(e.key)) {
            e.preventDefault()
            if (currentInput) {
                addEmailTag(currentInput)
            }
        }

        // Delete last tag when backspace is pressed with empty input
        if (e.key === 'Backspace' && !currentInput && emailTags.length > 0) {
            const newTags = [...emailTags]
            newTags.pop()
            setEmailTags(newTags)
        }
    }

    const handleInvite = () => {
        // Check for existing emails
        const invalid = emailTags.filter((email) => isEmailInClassroom(email))
        setInvalidEmails(invalid)

        if (invalid.length > 0) {
            return // Don't proceed if there are invalid emails
        }

        // Here you would handle the actual invitation process
        console.log(`Inviting ${emailTags.length} people as ${inviteRole}`)

        // Close the dialog and reset state
        setIsDialogOpen(false)
        setEmailTags([])
        setCurrentInput('')
        setValidationError('')
    }

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
                        <Button
                            variant="outline"
                            onClick={() =>
                                handleOpenDialog(CLASSROOM_ROLE_TEACHER)
                            }
                        >
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <PersonRow person={owner} />
                        {teachers.length > 0 ? (
                            teachers.map((teacher) => (
                                <PersonRow
                                    key={teacher.id || teacher.email}
                                    person={teacher}
                                />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm py-2">
                                No teachers assigned
                            </p>
                        )}
                    </div>
                </section>

                <Separator />

                <section>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold mb-2">
                            Judges ({judges.length})
                        </h3>
                        <Button
                            variant="outline"
                            onClick={() =>
                                handleOpenDialog(CLASSROOM_ROLE_JUDGE)
                            }
                        >
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {judges.length > 0 ? (
                            judges.map((judge) => (
                                <PersonRow
                                    key={judge.id || judge.email}
                                    person={judge}
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
                        <Button
                            variant="outline"
                            onClick={() =>
                                handleOpenDialog(CLASSROOM_ROLE_STUDENT)
                            }
                        >
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <PersonRow
                                    key={student.id || student.email}
                                    person={student}
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

            {/* Invite Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite {inviteRole}s</DialogTitle>
                        <DialogDescription>
                            Type an email address and press space or comma to
                            add it
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" value={inviteRole} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="emails">Email Addresses</Label>
                            <div className="flex flex-wrap gap-1 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                {emailTags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1 text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeEmailTag(index)
                                            }
                                            className="text-secondary-foreground/70 hover:text-secondary-foreground focus:outline-none"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M18 6 6 18"></path>
                                                <path d="m6 6 12 12"></path>
                                            </svg>
                                            <span className="sr-only">
                                                Remove
                                            </span>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    id="email-input"
                                    type="text"
                                    className="flex-1 outline-none bg-transparent min-w-[120px]"
                                    placeholder={
                                        emailTags.length === 0
                                            ? 'example@email.com'
                                            : ''
                                    }
                                    value={currentInput}
                                    onChange={(e) => {
                                        setCurrentInput(e.target.value)
                                        setValidationError('') // Clear validation error when typing
                                    }}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() =>
                                        currentInput &&
                                        addEmailTag(currentInput)
                                    }
                                />
                            </div>

                            {/* Email validation error message */}
                            {validationError && (
                                <div className="text-red-500 text-sm">
                                    {validationError}
                                </div>
                            )}

                            {invalidEmails.length > 0 && (
                                <div className="text-red-500 text-sm">
                                    <p>
                                        These emails are already in the
                                        classroom:
                                    </p>
                                    <ul className="list-disc pl-5">
                                        {invalidEmails.map((email) => (
                                            <li key={email}>{email}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleInvite}>Send Invitations</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

function PersonRow({ person }: { person: ClassroomUserDetail }) {
    // If the person only has an email (invited but not registered)
    const isInvited = !person.first_name && !person.last_name

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
        </div>
    )
}
