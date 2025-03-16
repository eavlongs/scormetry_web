"use client";

import { Button } from "@/components/ui/button";
import useSession from "@/hooks/useSession";
import { logout } from "@/lib/session";
import Link from "next/link";

import { useEffect } from "react";

export default function Home() {
    const session = useSession();

    useEffect(() => {
        console.log(session);
    }, [session]);

    return (
        <main className='flex-1'>
            <div className='container px-4 py-6 md:px-6 md:py-8'>
                <h1 className='text-3xl font-bold'>Welcome to Scormetry</h1>
                <p className='mt-4 text-muted-foreground'>
                    Your comprehensive classroom management solution
                </p>

                <Button
                    color='red'
                    onClick={async () => {
                        await logout();
                        window.location.href = "/";
                    }}
                >
                    Log out
                </Button>

                <Link href='/login'>
                    <Button>Log in</Button>
                </Link>
            </div>
        </main>
    );
}
