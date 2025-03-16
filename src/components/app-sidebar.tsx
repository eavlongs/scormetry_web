"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookOpen, Home, Settings, Users } from "lucide-react";
import Link from "next/link";

const sidebarLinks = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Students", href: "/students", icon: Users },
    { name: "Classes", href: "/classes", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className='flex h-14 items-center px-4 font-semibold'>
                    Scormetry
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarLinks.map((link) => (
                                <SidebarMenuItem key={link.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={link.href === "/"}
                                    >
                                        <Link href={link.href}>
                                            <link.icon className='h-4 w-4' />
                                            <span>{link.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
