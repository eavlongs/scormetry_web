'use client'

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
import { LabelWrapper } from '@/components/ui/label-wrapper'
import {
    getErrorMessageFromValidationError,
    getKeysFromValidationError,
} from '@/lib/utils'
import {
    KEYOF_ERR_USER_ALREADY_IN_CLASSROOM,
    ValidationError,
} from '@/types/response'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { joinClassroomByCode } from '../code/[code]/actions'

interface JoinClassroomDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function JoinClassroomDialog({
    open,
    setOpen,
}: JoinClassroomDialogProps) {
    const [classCode, setClassCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
        []
    )

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!classCode.trim()) {
            setValidationErrors([
                {
                    field: 'code',
                    message: 'Class code is required',
                },
            ])
            return
        }

        setIsLoading(true)
        setValidationErrors([])

        const response = await joinClassroomByCode(classCode)

        if (response.success) {
            // await revalidateData('/home')
            if (response.data)
                router.push(
                    `/classroom/${response.data.classroom.id}?success_message=${response.message}`
                )
            else toast.success(response.message)
            setClassCode('')
            setOpen(false)
        } else {
            if (
                response.error &&
                getKeysFromValidationError(response.error).includes(
                    KEYOF_ERR_USER_ALREADY_IN_CLASSROOM
                )
            ) {
                if (
                    response.data &&
                    !pathname.startsWith(
                        `/classroom/${response.data.classroom.id}`
                    )
                ) {
                    router.push(
                        `/classroom/${response.data.classroom.id}?error_message=${response.message}`
                    )
                    setIsLoading(false)
                    setClassCode('')
                    setOpen(false)
                    return
                }
            }
            toast.error(response.message)
        }

        setIsLoading(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClassCode(e.target.value)
        if (validationErrors) {
            setValidationErrors([])
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Join Class</DialogTitle>
                        <DialogDescription>
                            Enter the class code provided by your teacher to
                            join the classroom.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="w-full my-6">
                        <LabelWrapper
                            label={{
                                text: 'Class Code',
                                field: 'code',
                            }}
                            error={getErrorMessageFromValidationError(
                                validationErrors,
                                'code'
                            )}
                            options={{
                                label_placement: 'inline',
                            }}
                        >
                            <Input
                                id="code"
                                className="w-auto flex-1"
                                value={classCode}
                                onChange={handleInputChange}
                                placeholder="Enter class code"
                                autoComplete="off"
                            />
                        </LabelWrapper>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Joining...' : 'Join Class'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
