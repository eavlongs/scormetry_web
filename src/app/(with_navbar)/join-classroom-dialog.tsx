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
import { Label } from '@/components/ui/label'
import { KEYOF_ERR_USER_ALREADY_IN_CLASSROOM } from '@/types/response'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { joinClassroomByCode } from '../code/[code]/actions'
import { revalidateData } from './actions'

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
    const [validationError, setValidationError] = useState<string | null>(null)
    const router = useRouter()
    const pathname = usePathname()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!classCode.trim()) {
            setValidationError('Please enter a class code')
            return
        }

        setIsLoading(true)
        setValidationError(null)

        const response = await joinClassroomByCode(classCode)

        if (response.success) {
            await revalidateData('/')
            if (response.data)
                router.push(
                    `/classroom/${response.data.classroom.id}?success_message=${response.message}`
                )
            else {
                toast.success(response.message)
            }
        } else {
            if (response.error_type === KEYOF_ERR_USER_ALREADY_IN_CLASSROOM) {
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
                toast.error(response.message)
            }
        }

        setIsLoading(false)
        setClassCode('')
        setOpen(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClassCode(e.target.value)
        if (validationError) {
            setValidationError(null)
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
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="classCode" className="text-right">
                                Class Code
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="classCode"
                                    value={classCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter class code"
                                    className={
                                        validationError ? 'border-red-500' : ''
                                    }
                                    autoComplete="off"
                                />
                                {validationError && (
                                    <p className="text-sm text-red-500">
                                        {validationError}
                                    </p>
                                )}
                            </div>
                        </div>
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
