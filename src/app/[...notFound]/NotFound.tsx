'use client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()
    return (
        <div className="fixed z-[1001] top-0 left-0 right-0 bottom-0 min-h-screen min-w-screen bg-white">
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
                <div className="container flex max-w-[64rem] flex-col items-center justify-center gap-4 px-4 py-16 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center text-center"
                    >
                        <h1 className="text-9xl font-bold tracking-tighter text-primary">
                            404
                        </h1>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight">
                            Page Not Found
                        </h2>
                        <p className="mt-4 max-w-[42rem] text-muted-foreground sm:text-xl">
                            We couldn't find the page you're looking for.
                        </p>

                        <div className="mt-8 flex gap-4">
                            <Button asChild size="lg">
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" /> Go Home
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
