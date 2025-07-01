'use client'

import { Button } from '@/components/ui/button'
import { REDIRECT_URL_NAME } from '@/types/auth'
import { usePathname } from 'next/navigation'

export default function ChangeAccountButton() {
    const pathname = usePathname()
    return (
        <Button
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
            onClick={async () => {
                // await logout()
                const urlSearchParams = new URLSearchParams()
                urlSearchParams.set(REDIRECT_URL_NAME, pathname)

                console.log(`/logout?${urlSearchParams.toString()}`)
                window.location.href = `/logout?${urlSearchParams.toString()}`
            }}
        >
            Change Account
        </Button>
    )
}
