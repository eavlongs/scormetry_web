'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function LoginErrorToast() {
    const searchParams = useSearchParams()
    const [messageShown, setMessageShown] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (searchParams.has('error') && !messageShown) {
            const urlSearchParams = new URLSearchParams(searchParams)
            urlSearchParams.delete('error')

            const errorMessage = searchParams.get('error')
            if (errorMessage) {
                toast.error(errorMessage)
                setMessageShown(true)
                router.replace(pathname + `?${urlSearchParams}`)
            }
        }
    }, [searchParams, messageShown])

    return <></>
}
