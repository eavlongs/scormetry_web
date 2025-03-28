import { createClassroom } from '@/app/(with_navbar)/actions'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    cn,
    getErrorMessageFromValidationError,
    getRandomColor,
} from '@/lib/utils'
import { colorMap, ColorType } from '@/types/classroom'
import { VALIDATION_ERROR_MESSAGE, ValidationError } from '@/types/response'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function CreateClassroomDialog({
    open,
    setOpen,
}: {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const nameRef = useRef<HTMLInputElement>(null)
    const [color, setColor] = useState<ColorType>(getRandomColor())
    const [validationError, setValidationError] = useState<ValidationError[]>(
        []
    )
    const router = useRouter()

    async function handleSubmit() {
        setValidationError([])
        if (nameRef.current?.value) {
            const response = await createClassroom(nameRef.current.value, color)

            if (response.success) {
                toast.success(response.message)
                setOpen(false)
                if (response.data)
                    router.push(`/classroom/${response.data.classroom.id}`)
                return
            }
            if (
                response.message === VALIDATION_ERROR_MESSAGE &&
                response.error
            ) {
                setValidationError(response.error)
                return
            }
            toast.error(response.message)
        }
    }

    useEffect(() => {
        if (open) {
            setColor(getRandomColor())
        }
    }, [open])

    useEffect(() => {
        if (open) {
            setValidationError([])
        }
    }, [open])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create Class</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="w-full">
                    <div className="flex flex-col mb-4">
                        <LabelWrapper
                            label={{ text: 'Class Name', field: 'name' }}
                            error={getErrorMessageFromValidationError(
                                validationError,
                                'name'
                            )}
                        >
                            <Input id="name" ref={nameRef} className="w-full" />
                        </LabelWrapper>
                        {/* <Label htmlFor="name">Class Name</Label>
                        <Input id="name" ref={nameRef} className="w-full" /> */}
                    </div>
                    <div className="flex gap-x-4 mb-4">
                        <LabelWrapper
                            label={{ text: 'Color', field: 'color' }}
                            error={getErrorMessageFromValidationError(
                                validationError,
                                'color'
                            )}
                            options={{
                                required: true,
                                label_placement: 'inline',
                            }}
                        >
                            <Select
                                value={color}
                                onValueChange={(val) =>
                                    setColor(val as ColorType)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a color" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Colors</SelectLabel>
                                        {(
                                            Object.keys(colorMap) as ColorType[]
                                        ).map((color) => (
                                            <SelectItem
                                                value={color}
                                                key={color}
                                            >
                                                <span
                                                    className={cn(
                                                        'w-4 h-4 rounded-full',
                                                        colorMap[color]
                                                    )}
                                                ></span>
                                                <span className="capitalize">
                                                    {color}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </LabelWrapper>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleSubmit}>Create</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
