// app/login/google/route.ts
import { google } from '@/lib/auth'
import {
    GOOGLE_CODE_VERIFIER_COOKIE_NAME,
    GOOGLE_OAUTH_STATE_COOKIE_NAME,
    REDIRECT_URL_COOKIE_NAME,
    REDIRECT_URL_NAME,
} from '@/types/auth'
import { generateCodeVerifier, generateState } from 'arctic'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<Response> {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()

    console.log({ searchParams: request.nextUrl.searchParams })
    const redirectUrl =
        request.nextUrl.searchParams.get(REDIRECT_URL_NAME) ?? '/'

    console.log('here')
    console.log(redirectUrl)
    console.log('here')

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
