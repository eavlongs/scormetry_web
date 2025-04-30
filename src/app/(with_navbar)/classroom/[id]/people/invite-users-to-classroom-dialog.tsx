import { Button } from '@/components/ui/button'
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
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { getErrorMessageFromValidationError } from '@/lib/utils'
import { ClassroomRole } from '@/types/classroom'
import { ValidationError } from '@/types/response'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from '../actions'
import { inviteUsersToClassroom } from './actions'

export function InviteUsersToClassroomDialog({
    classroom,
    roleOfUserToInvite,
    setRoleOfUserToInvite,
}: {
    classroom: GetClassroomResponse
    roleOfUserToInvite: ClassroomRole | null
    setRoleOfUserToInvite: React.Dispatch<
        React.SetStateAction<ClassroomRole | null>
    >
}) {
    const [emailTags, setEmailTags] = useState<string[]>([])
    const [currentInput, setCurrentInput] = useState('')
    const [invalidEmails, setInvalidEmails] = useState<string[]>([])
    const [validationError, setValidationError] = useState<ValidationError[]>(
        []
    )

    // Email validation regex
    function validateEmail(email: string) {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(email).toLowerCase())
    }

    // Function to check if email is already in the classroom
    function isEmailInClassroom(email: string) {
        const usersAlreadyInClassroom = [
            classroom.people.owner,
            ...classroom.people.teachers,
            ...classroom.people.judges,
            ...classroom.people.students,
        ].filter((u) => u.first_name && u.last_name)

        const allEmails = usersAlreadyInClassroom.map((u) =>
            u.email.toLowerCase()
        )

        return allEmails.includes(email.toLowerCase())
    }

    useEffect(() => {
        if (!roleOfUserToInvite) return
        setEmailTags([])
        setInvalidEmails([])
        setValidationError([])
    }, [roleOfUserToInvite])

    function addEmailTag(email: string): boolean {
        email = email.trim()

        // Clear previous validation errors
        setValidationError([])

        // Don't add empty emails
        if (!email) return false

        // Check if email is valid using regex
        if (!validateEmail(email)) {
            setValidationError([
                {
                    field: 'email',
                    message: `"${email}" is not a valid email address`,
                },
            ])
            return false
        }

        // Check if email is already added as a tag
        if (emailTags.includes(email)) {
            setValidationError([
                {
                    field: 'email',
                    message: `"${email}" has already been added`,
                },
            ])
            return false
        }

        if (isEmailInClassroom(email)) {
            setValidationError([
                {
                    field: 'email',
                    message: `"${email}" is already in the classroom`,
                },
            ])
            return false
        }

        // Add valid email as a tag
        setEmailTags([...emailTags, email])
        setCurrentInput('')
        return true
    }

    function removeEmailTag(indexToRemove: number) {
        setEmailTags(emailTags.filter((_, index) => index !== indexToRemove))
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        // Add tag when space, comma, or Enter is pressed
        if ([' ', ',', 'Enter'].includes(e.key)) {
            e.preventDefault()
            handleAddEmailToTag()
            return
        }

        if (e.key === 'Backspace') {
            if (currentInput.length === 0) {
                setEmailTags(emailTags.slice(0, -1))
            }
        }
    }

    function handleAddEmailToTag(): boolean {
        if (currentInput) {
            return addEmailTag(currentInput)
        }

        return true
    }

    async function handleInvite() {
        setValidationError([])
        if (!roleOfUserToInvite) return
        const invalid = emailTags.filter((email) => isEmailInClassroom(email))
        setInvalidEmails(invalid)

        if (invalid.length > 0) {
            return // Don't proceed if there are invalid emails
        }

        // Make sure all inputs are in tags
        const ok = handleAddEmailToTag()

        if (!ok) return

        const usersToInvite = emailTags.map((email) => ({
            email,
            role: roleOfUserToInvite,
        }))

        const response = await inviteUsersToClassroom(
            classroom.classroom.id,
            usersToInvite
        )

        if (!response.success) {
            if (response.error) {
                console.log(response.error)
                setValidationError(response.error)
                return
            }
            toast.error(response.message)
            return
        }

        toast.success(response.message)

        // Close the dialog and reset state
        setRoleOfUserToInvite(null)
        setEmailTags([])
        setCurrentInput('')
        setValidationError([])
    }

    return (
        <Dialog
            open={roleOfUserToInvite != null}
            onOpenChange={(val) => (!val ? setRoleOfUserToInvite(null) : null)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite {roleOfUserToInvite}s</DialogTitle>
                    <DialogDescription>
                        Type an email address and press space or comma to add it
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            value={roleOfUserToInvite ?? ''}
                            disabled
                            className="capitalize"
                        />
                    </div>
                    <div className="grid gap-2">
                        <LabelWrapper
                            label={{ text: 'Email Addresses', field: 'email' }}
                            error={getErrorMessageFromValidationError(
                                validationError,
                                ['email', 'users']
                            )}
                            options={{
                                required: true,
                                label_placement: 'newline',
                            }}
                        >
                            <div className="flex flex-wrap gap-1 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                {emailTags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="bg-paragon text-white px-2 py-1 rounded-md flex items-center gap-1 text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeEmailTag(index)
                                            }
                                            className="cursor-pointer border-paragon border-1 hover:border-white rounded-full p-0.5 text-white focus:outline-none"
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
                                        setValidationError([]) // Clear validation error when typing
                                    }}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() =>
                                        currentInput &&
                                        addEmailTag(currentInput)
                                    }
                                />
                            </div>
                        </LabelWrapper>

                        {invalidEmails.length > 0 && (
                            <div className="text-red-500 text-sm">
                                <p>
                                    These emails are already in the classroom:
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
    )
}
