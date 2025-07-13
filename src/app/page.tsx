import { Button } from '@/components/ui/button'
import { getServerSession } from '@/lib/server-session'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
    const session = await getServerSession()
    const isLoggedIn = session.isAuthenticated

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation Bar */}
            <header className="w-full py-4 px-6 flex justify-between items-center border-b">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-bold text-xl">Scormetry</span>
                </Link>

                <div>
                    {isLoggedIn ? (
                        <Link href="/home">
                            <Button>My Account</Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button>Log in</Button>
                        </Link>
                    )}
                </div>
            </header>

            {/* Main Content Section - Side by Side Layout */}
            <section className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-x-24 gap-y-16">
                    {/* Logo Column */}
                    <div className="flex-shrink-0 flex justify-center md:justify-end">
                        <Image
                            src="/paragon-logo.svg"
                            alt="Paragon International University"
                            width={120}
                            height={120}
                        />
                    </div>

                    {/* Text Column */}
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                            Scormetry: A Digital Score Tabulation System For
                            Paragon International University
                        </h1>

                        <div className="text-lg text-muted-foreground mb-6 flex flex-col gap-4">
                            <p className="flex">
                                <span className="mr-2">•</span>
                                <span>
                                    Improve the efficiency of score tabulation
                                    by automating calculations based on
                                    predefined scoring rules, enabling quick and
                                    accurate result generation.
                                </span>
                            </p>
                            <p className="flex">
                                <span className="mr-2">•</span>
                                <span>
                                    Reduce the administrative burden of managing
                                    judges by allowing easy assignment,
                                    permission control, and ensuring each judge
                                    can only access and submit scores for their
                                    designated groups or individuals.
                                </span>
                            </p>
                        </div>

                        <div className="flex justify-center md:justify-start">
                            <Link href="/login">
                                <Button size="lg">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimal Footer */}
            <footer className="w-full py-4 px-6 border-t">
                <p className="text-sm text-muted-foreground text-center">
                    © {new Date().getFullYear()}, Paragon International
                    University
                </p>
            </footer>
        </div>
    )
}
