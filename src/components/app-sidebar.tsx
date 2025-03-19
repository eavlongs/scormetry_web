'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Classroom, classroomRelations, colorMap } from '@/types/classroom'
import Link from 'next/link'
import { Fragment } from 'react'

export function AppSidebar({
    classrooms,
}: {
    classrooms: {
        teaching_classrooms: Classroom[]
        studying_classrooms: Classroom[]
        judging_classrooms: Classroom[]
    }
}) {
    return (
        <Sidebar>
            <SidebarHeader>
                <Link
                    href="/"
                    className="flex h-14 items-center px-4 font-semibold"
                >
                    Scormetry
                </Link>
            </SidebarHeader>
            <SidebarContent className="overflow-x-clip px-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0">
                            {classroomRelations.map((relation) => {
                                let classroomsToRender: Classroom[] = []

                                switch (relation) {
                                    case 'teaching':
                                        classroomsToRender =
                                            classrooms.teaching_classrooms
                                        break
                                    case 'studying':
                                        classroomsToRender =
                                            classrooms.studying_classrooms
                                        break
                                    case 'judging':
                                        classroomsToRender =
                                            classrooms.judging_classrooms
                                        break
                                }

                                return (
                                    <Fragment key={relation}>
                                        {classroomsToRender.length > 0 && (
                                            <span className="capitalize font-bold my-2 text-base">
                                                {relation}
                                            </span>
                                        )}
                                        {classroomsToRender.map((classroom) => (
                                            <SidebarMenuItem
                                                key={classroom.id}
                                                className="px-0"
                                            >
                                                <SidebarMenuButton asChild>
                                                    <Link
                                                        href={`/classroom/${classroom.id}`}
                                                        className="px-0 py-6"
                                                    >
                                                        <span
                                                            className={cn(
                                                                'rounded-full text-white px-2 py-1',
                                                                colorMap[
                                                                    classroom
                                                                        .color
                                                                ]
                                                            )}
                                                        >
                                                            {classroom.name[0].toUpperCase()}
                                                        </span>
                                                        <span className="!font-bold">
                                                            {classroom.name}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </Fragment>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
