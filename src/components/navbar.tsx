'use client'

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
import { LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { CreateClassroomDialog } from '../app/(with_navbar)/create-classroom-dialog'

export function Navbar() {
    const session = useSession()
    const { createClassroomDialogOpen, setCreateClassroomDialog } =
        useAppContext()

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="h-9 w-9 p-0" />
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold">Scormetry</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <CreateClassroomDialog
                        open={createClassroomDialogOpen}
                        setOpen={setCreateClassroomDialog}
                    />

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
                                            src={session.user.profile_picture}
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
                        <DropdownMenuContent align="center" className="mt-2">
                            <DropdownMenuItem
                                className="cursor-pointer p-2"
                                onClick={async () => {
                                    await logout()
                                    window.location.href = '/login'
                                }}
                            >
                                <LogOut className="mx-2 h-4 w-4" color="red" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
