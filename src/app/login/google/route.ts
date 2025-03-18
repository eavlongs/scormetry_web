// app/login/google/route.ts
import { google } from '@/lib/auth'
import { generateCodeVerifier, generateState } from 'arctic'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export const GOOGLE_OAUTH_STATE_COOKIE_NAME = 'google_oauth_state'
export const GOOGLE_CODE_VERIFIER_COOKIE_NAME = 'google_code_verifier'
export const REDIRECT_URL_COOKIE_NAME = 'redirect_url'

export async function GET(request: NextRequest): Promise<Response> {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const redirectUrl = request.nextUrl.searchParams.get('redirect_url') ?? '/'

    const url = google.createAuthorizationURL(state, codeVerifier, [
        'openid',
        'email',
        'profile',
    ])

    const cookieStore = await cookies()
    cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE_NAME, state, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax',
    })
    cookieStore.set(GOOGLE_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax',
    })
    cookieStore.set(REDIRECT_URL_COOKIE_NAME, redirectUrl, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax',
    })

    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString(),
        },
    })
}
