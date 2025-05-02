'use client'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GetActivity } from '@/types/classroom'
import { Users } from 'lucide-react'
import Image from 'next/image'

export default function ActivityStudents({
    activity,
}: {
    activity: GetActivity
}) {
    return (
        <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="pr-4">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Students</h2>
                    <Badge variant="outline" className="ml-auto">
                        {activity.students?.length || 0} students
                    </Badge>
                </div>
                <div className="border rounded-lg bg-card divide-y divide-border">
                    {activity.students?.map((student) => (
                        <div
                            key={student.id}
                            className="px-4 py-2.5 flex items-center gap-x-3 hover:bg-muted/50 transition-colors"
                        >
                            <div className="relative h-8 w-8 shrink-0">
                                <Image
                                    src={student.profile_picture}
                                    alt={`${student.first_name} ${student.last_name}`}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {student.first_name} {student.last_name}
                                </p>
                                <p className="h-5 px-0 text-xs text-muted-foreground justify-start font-normal truncate max-w-full">
                                    {student.email}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ScrollArea>
    )
}
