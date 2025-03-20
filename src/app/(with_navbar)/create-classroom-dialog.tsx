import { createClassroom } from '@/app/(with_navbar)/actions'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
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
import { cn, getRandomColor } from '@/lib/utils'
import { colorMap, ColorType } from '@/types/classroom'
import { Plus } from 'lucide-react'
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

    async function handleSubmit() {
        if (nameRef.current?.value) {
            const response = await createClassroom(nameRef.current.value, color)

            if (response.success) {
                toast.success(response.message)
                setOpen(false)
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

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className="flex items-center py-1">
                    <Plus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Class</span>
                    <span className="sr-only md:hidden">Add class</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create Class</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="w-full">
                    <div className="flex flex-col gap-y-2 mb-4">
                        <Label htmlFor="name">Class Name</Label>
                        <Input id="name" ref={nameRef} className="w-full" />
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
                    <Button onClick={handleSubmit}>Create</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
