'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import NotFound from './NotFound'

export default function Page() {
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.has('redirect_url')) {
            window.history.replaceState(
                null,
                '',
                searchParams.get('redirect_url')
            )
        }
    }, [searchParams])

    return <NotFound />
}
