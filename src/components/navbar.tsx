"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Plus } from "lucide-react";
import Link from "next/link";

export function Navbar() {
    return (
        <header className='sticky top-0 z-40 w-full border-b bg-background'>
            <div className='container flex h-16 items-center justify-between px-4 md:px-6'>
                <div className='flex items-center gap-2'>
                    <SidebarTrigger className='h-9 w-9 p-0' />
                    <Link href='/' className='flex items-center gap-2'>
                        <span className='text-xl font-bold'>Scormetry</span>
                    </Link>
                </div>

                <div className='flex items-center gap-4'>
                    <Button className='hidden md:flex'>
                        <Plus className='mr-2 h-4 w-4' />
                        Class
                    </Button>
                    <Button variant='outline' size='icon' className='md:hidden'>
                        <Plus className='h-5 w-5' />
                        <span className='sr-only'>Add class</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='rounded-full'
                            >
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage
                                        src='/placeholder.svg?height=32&width=32'
                                        alt='User'
                                    />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='center' className='mt-2'>
                            <DropdownMenuItem className='cursor-pointer p-2'>
                                <LogOut className='mx-2 h-4 w-4' color='red' />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
