'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import {
    Classroom,
    ClassroomRelationJudge,
    ClassroomRelationStudent,
    ClassroomRelationTeacher,
    classroomRelations,
    colorMap,
} from '@/types/classroom'
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
                    href="/home"
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
                                    case ClassroomRelationTeacher:
                                        classroomsToRender =
                                            classrooms.teaching_classrooms
                                        break
                                    case ClassroomRelationJudge:
                                        classroomsToRender =
                                            classrooms.judging_classrooms
                                        break
                                    case ClassroomRelationStudent:
                                        classroomsToRender =
                                            classrooms.studying_classrooms
                                        break
                                }

                                return (
                                    <Fragment key={relation}>
                                        {classroomsToRender.length > 0 && (
                                            <span className="font-bold my-2 text-base">
                                                {relation}
                                            </span>
                                        )}
                                        {classroomsToRender.map(
                                            (classroom, i) => (
                                                <SidebarMenuItem
                                                    key={classroom.id}
                                                    className={cn(
                                                        'px-0',
                                                        i != 0 &&
                                                            'border-t border-gray-300'
                                                    )}
                                                >
                                                    <SidebarMenuButton asChild>
                                                        <Link
                                                            href={`/classroom/${classroom.id}`}
                                                            className="px-0 py-6"
                                                        >
                                                            <Avatar>
                                                                <AvatarFallback
                                                                    className={cn(
                                                                        'text-white px-2 py-1',
                                                                        colorMap[
                                                                            classroom
                                                                                .color
                                                                        ]
                                                                    )}
                                                                >
                                                                    {classroom.name[0].toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>
                                                                {classroom.name}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        )}
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
