import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import type React from 'react'
import AppProvider from './AppProvider'
import AuthProvider from './AuthProvider'
import { font } from './font'
import './globals.css'

const fontToDisplay = font

export const metadata: Metadata = {
    title: 'Scormetry - A Digital Score Tabulation System',
    keywords: [
        'Scormetry',
        'Digital Score Tabulation',
        'Paragon International University',
        'Score Management',
        'Student Scores',
        'Tabulation System',
        'Panel Evaluation',
        'Multi-Judge Evaluation',
    ],
    description:
        'Scormetry is a digital score tabulation system designed for Paragon International University',
    other: {
        'google-site-verification':
            'VaNPhkZrn2chTNnfLliY8DNJ_cN1jTRGODLJJ6X9-20',
    },
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
