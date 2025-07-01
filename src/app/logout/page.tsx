'use client'

import { logout } from '@/lib/session'
import { REDIRECT_URL_NAME } from '@/types/auth'
import { redirect, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function Logout() {
    const searchParams = useSearchParams()

    useEffect(() => {
        console.log('here')
        async function handleLogout() {
            console.group(searchParams.toString())
            let redirectUrl = ''
            if (searchParams.has(REDIRECT_URL_NAME)) {
                redirectUrl =
                    `?${REDIRECT_URL_NAME}=` +
                    encodeURIComponent(
                        searchParams.get(REDIRECT_URL_NAME) || ''
                    )
            }

            await logout()
            redirect(`/login${redirectUrl}`)
        }

        handleLogout()
    }, [searchParams])
}
