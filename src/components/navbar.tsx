'use client'

import { JoinClassroomDialog } from '@/app/(with_navbar)/join-classroom-dialog'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useAppContext from '@/hooks/useAppContext'
import useSession from '@/hooks/useSession'
import { logout } from '@/lib/session'
import { Hash, LogOut, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { CreateClassroomDialog } from '../app/(with_navbar)/create-classroom-dialog'

export function Navbar() {
    const session = useSession()
    const { createClassroomDialogOpen, setCreateClassroomDialog } =
        useAppContext()
    const [joinClassroomDialogOpen, setJoinClassroomDialog] = useState(false)

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="h-9 w-9 p-0" />
                    <Link href="/home" className="flex items-center gap-2">
                        <span className="text-xl font-bold">Scormetry</span>
                    </Link>
                </div>
                <div className="flex items-center gap-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="flex items-center py-1">
                                <Plus className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Class</span>
                                <span className="sr-only md:hidden">
                                    Add class
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="mt-2">
                            <DropdownMenuItem
                                className="cursor-pointer p-2"
                                onClick={() => setCreateClassroomDialog(true)}
                            >
                                <Plus className="mx-2 h-4 w-4" />
                                <span>Create class</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer p-2"
                                // You'll need to implement this function
                                onClick={() => {
                                    setJoinClassroomDialog(true)
                                }}
                            >
                                <Hash className="mx-2 h-4 w-4" />
                                <span>Add class</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                >
                                    <div className="relative h-8 w-8 cursor-pointer">
                                        {session.user ? (
                                            <Image
                                                src={
                                                    session.user.profile_picture
                                                }
                                                alt={
                                                    session.user.first_name +
                                                    ' ' +
                                                    session.user.last_name
                                                }
                                                fill
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <Image
                                                src="/user_placeholder.png"
                                                alt="User"
                                                fill
                                                className="rounded-full"
                                            />
                                        )}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="center"
                                className="mt-2"
                            >
                                <DropdownMenuItem
                                    className="cursor-pointer p-2"
                                    onClick={async () => {
                                        await logout()
                                        window.location.href = '/'
                                    }}
                                >
                                    <LogOut
                                        className="mx-2 h-4 w-4"
                                        color="red"
                                    />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <CreateClassroomDialog
                            open={createClassroomDialogOpen}
                            setOpen={setCreateClassroomDialog}
                        />

                        <JoinClassroomDialog
                            open={joinClassroomDialogOpen}
                            setOpen={setJoinClassroomDialog}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}
