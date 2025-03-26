import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type React from 'react'
import AppProvider from './AppProvider'
import AuthProvider from './AuthProvider'
import './globals.css'

// const tmp = Roboto({ subsets: ["latin"] });
// const tmp = Poppins({ subsets: ["latin"], weight: "400" });
const tmp = Inter({ subsets: ['latin'] })

const fontToDisplay = tmp

export const metadata: Metadata = {
    title: 'Scormetry',
    description: 'Your comprehensive classroom management solution',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={fontToDisplay.className}>
                <Toaster richColors />
                <AuthProvider>
                    <AppProvider>{children}</AppProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
