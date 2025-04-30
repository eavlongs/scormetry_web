'use client'

import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { GetGroup } from '@/types/classroom'
import { ChevronDown, Users } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function ActivityGroups({ groups }: { groups: GetGroup[] }) {
    const [openGroups, setOpenGroups] = useState<string[]>([])

    const toggleGroup = (groupId: string) => {
        setOpenGroups((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        )
    }

    return (
        <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="pr-4">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Groups</h2>
                    <Badge variant="outline" className="ml-auto">
                        {groups.length} groups
                    </Badge>
                </div>
                <div className="space-y-3">
                    {groups.map((group) => (
                        <Collapsible
                            key={group.id}
                            open={openGroups.includes(group.id)}
                            onOpenChange={() => toggleGroup(group.id)}
                            className="border rounded-lg bg-card"
                        >
                            <CollapsibleTrigger className="w-full">
                                <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between hover:bg-muted/60 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {group.name}
                                        </span>
                                        <Badge variant="secondary">
                                            {group.users.length} members
                                        </Badge>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-muted-foreground transition-transform',
                                            openGroups.includes(group.id) &&
                                                'transform rotate-180'
                                        )}
                                    />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="divide-y divide-border">
                                {group.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="px-4 py-2.5 flex items-center gap-x-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="relative h-8 w-8 shrink-0">
                                            <Image
                                                src={user.profile_picture}
                                                alt={`${user.first_name} ${user.last_name}`}
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {user.first_name}{' '}
                                                {user.last_name}
                                            </p>

                                            <p className="h-5 px-0 text-xs text-muted-foreground justify-start font-normal truncate max-w-full">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </div>
        </ScrollArea>
    )
}
