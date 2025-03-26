import LoginWithGoogle from '@/components/login-with-google'
import { REDIRECT_URL_NAME } from '@/types/auth'

export default async function Page({
    searchParams,
}: {
    searchParams: {
        [REDIRECT_URL_NAME]: string
    }
}) {
    const { [REDIRECT_URL_NAME]: redirectUrl } = await searchParams
    return (
        <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
                <p className="text-gray-500 mt-2">
                    Sign in to continue to Scormetry
                </p>
            </div>
            <LoginWithGoogle redirectUrl={redirectUrl ?? '/'} />
        </div>
    )
}
