import LoginWithGoogle from '@/components/login-with-google'
import { REDIRECT_URL_NAME } from '@/types/auth'
import Link from 'next/link'

import LoginErrorToast from './login-error-toast'

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        [REDIRECT_URL_NAME]: string
    }>
}) {
    const { [REDIRECT_URL_NAME]: redirectUrl } = await searchParams
    return (
        <>
            <header className="w-full py-4 px-6 flex justify-between items-center border-b">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-bold text-xl">Scormetry</span>
                </Link>
            </header>
            <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Sign in to continue to Scormetry
                    </p>
                </div>
                <LoginWithGoogle redirectUrl={redirectUrl ?? '/home'} />
                <LoginErrorToast />
            </div>
        </>
    )
}
