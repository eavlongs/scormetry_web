import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import type React from 'react'
import AppProvider from './AppProvider'
import AuthProvider from './AuthProvider'
import { font } from './font'
import './globals.css'

const fontToDisplay = font

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
                <Toaster richColors position="bottom-center" />
                <AuthProvider>
                    <AppProvider>{children}</AppProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
