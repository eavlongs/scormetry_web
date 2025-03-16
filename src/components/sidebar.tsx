"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Home, Settings, Users } from "lucide-react";
import Link from "next/link";

const sidebarLinks = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Students", href: "/students", icon: Users },
    { name: "Classes", href: "/classes", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    return (
        <div className='flex h-full flex-col border-r bg-background'>
            <div className='flex h-14 items-center border-b px-4 lg:h-[60px]'>
                <Link
                    href='/'
                    className='flex items-center gap-2 font-semibold'
                >
                    Scormetry
                </Link>
            </div>
            <div className='flex-1 overflow-auto py-2'>
                <nav className='grid items-start px-2 text-sm font-medium'>
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                link.href === "/" &&
                                    "bg-accent text-accent-foreground"
                            )}
                        >
                            <link.icon className='h-4 w-4' />
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
