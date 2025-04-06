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
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { colorMap, ColorType } from '@/types/classroom'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { editClassroom, GetClassroomResponse } from './actions'

export default function EditClassroomDialog({
    classroom,
    open,
    setOpen,
}: {
    classroom: GetClassroomResponse
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}) {
    const nameRef = useRef<HTMLInputElement>(null)
    const [color, setColor] = useState<ColorType>(classroom.classroom.color)

    useEffect(() => {
        if (!open) {
            if (nameRef.current) {
                nameRef.current.value = classroom.classroom.name
            }
            setColor(classroom.classroom.color)
        } else {
            if (nameRef.current) nameRef.current.focus()
        }
    }, [open])

    async function handleSubmit() {
        if (nameRef.current?.value) {
            const response = await editClassroom(
                classroom.classroom.id,
                nameRef.current.value,
                color
            )

            if (response.success) {
                setOpen(false)
                toast.success(response.message)
                return
            }
            toast.error(response.message)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Class</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="w-full">
                    <div className="flex flex-col gap-y-2 mb-4">
                        <Label htmlFor="name">Class Name</Label>
                        <Input
                            id="name"
                            ref={nameRef}
                            className="w-full"
                            defaultValue={classroom.classroom.name}
                        />
                    </div>
                    <div className="flex gap-x-4 mb-4">
                        <Label htmlFor="color">Color</Label>
                        <Select
                            value={color}
                            onValueChange={(val) => setColor(val as ColorType)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a color" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Colors</SelectLabel>
                                    {(Object.keys(colorMap) as ColorType[]).map(
                                        (color) => (
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
                                        )
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleSubmit}>Update</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
