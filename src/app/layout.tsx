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
            <head>
                <link
                    href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css"
                    rel="stylesheet"
                />
            </head>
            <body className={fontToDisplay.className}>
                <Toaster richColors />
                <AuthProvider>
                    <AppProvider>{children}</AppProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
