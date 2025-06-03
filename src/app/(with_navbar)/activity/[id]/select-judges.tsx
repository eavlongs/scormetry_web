'use client'

import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import useSession from '@/hooks/useSession'
import { UserEssentialDetail } from '@/types/auth'
import { Check, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

interface SelectJudgesProps {
    judges: UserEssentialDetail[]
    selectedJudges?: UserEssentialDetail[]
    onSelectedJudgeValueChange: (judges: UserEssentialDetail[]) => void
}

export function SelectJudges({
    judges,
    selectedJudges = [],
    onSelectedJudgeValueChange,
}: SelectJudgesProps) {
    const session = useSession()
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const [selected, setSelected] =
        useState<UserEssentialDetail[]>(selectedJudges)

    const filteredJudges = useMemo(() => {
        return judges.filter((judge) => {
            const searchLower = search.toLowerCase()
            return (
                judge.first_name.toLowerCase().includes(searchLower) ||
                judge.last_name.toLowerCase().includes(searchLower) ||
                judge.email.toLowerCase().includes(searchLower)
            )
        })
    }, [judges, search])

    const toggleJudge = (judge: UserEssentialDetail) => {
        const isSelected = selected.some((j) => j.id === judge.id)
        let newSelected: UserEssentialDetail[]

        if (isSelected) {
            newSelected = selected.filter((j) => j.id !== judge.id)
        } else {
            newSelected = [...selected, judge]
        }

        setSelected(newSelected)
        onSelectedJudgeValueChange(newSelected)
    }

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                {/* TODO fix line clamp, probably need to set width */}
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selected.length === 0 && 'Select judges...'}
                    {selected.length > 0 &&
                        selected
                            .map(
                                (judge) =>
                                    judge.first_name + ' ' + judge.last_name
                            )
                            .join(', ')}
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
                </Button>
                {/* <Button variant="outline" className="w-full justify-start ">
                    {selected.length === 0 && 'Select judges...'}
                    {selected.length > 0 &&
                        selected
                            .map(
                                (judge) =>
                                    judge.first_name + ' ' + judge.last_name
                            )
                            .join(', ')}
                </Button> */}
            </PopoverTrigger>
            <PopoverContent className="p-0 pointer-events-auto" align="start">
                <Command className="pointer-events-auto">
                    <CommandInput
                        placeholder="Search judges..."
                        value={search}
                        onValueChange={setSearch}
                        className="pointer-events-auto"
                    />
                    <CommandEmpty>No judges found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {filteredJudges.map((judge) => {
                                const isSelected = selected.some(
                                    (j) => j.id === judge.id
                                )
                                return (
                                    <CommandItem
                                        key={judge.id}
                                        onSelect={() => toggleJudge(judge)}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="cursor-pointer">
                                            <div>
                                                {`${judge.first_name} ${judge.last_name}`}
                                                {session &&
                                                    session.user &&
                                                    session.user.id ==
                                                        judge.id &&
                                                    ' (Me)'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {judge.email}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
