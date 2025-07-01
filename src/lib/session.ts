'use server'

import {
    ACCESS_TOKEN_COOKIE_NAME,
    AccessTokenJWTPayload,
    JWT_SECRET,
    REFRESH_TOKEN_COOKIE_NAME,
    Session,
    Tokens,
    UnauthenticatedSession,
} from '@/types/auth'
import { ApiResponse } from '@/types/response'
import * as jose from 'jose'
import { cookies } from 'next/headers'

import { api } from './axios'

export async function createSession(accessToken: string, refreshToken: string) {
    const accessTokenPayload = await getDataFromToken(accessToken)
    const refreshTokenPayload = await getDataFromToken(refreshToken)

    if (accessTokenPayload === null || refreshTokenPayload === null) {
        throw new Error('Invalid access or refresh token')
    }

    const cookieStore = await cookies()

    const accessTokenMaxAge =
        accessTokenPayload.exp - Math.floor(Date.now() / 1000)
    const refreshTokenMaxAge =
        refreshTokenPayload.exp - Math.floor(Date.now() / 1000)

    cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        maxAge: accessTokenMaxAge,
        sameSite: 'lax',
    })

    cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        maxAge: refreshTokenMaxAge,
        sameSite: 'lax',
    })
}

export async function getDataFromToken(token: string) {
    if (JWT_SECRET === '') {
        if (window !== undefined) {
            throw new Error('getDataFromToken can only be used server-side')
        }
        throw new Error('JWT_SECRET environment variable is not set')
    }

    try {
        const secretKey = new TextEncoder().encode(JWT_SECRET)

        // Verify and decode the token
        const { payload } = await jose.jwtVerify(token, secretKey, {
            algorithms: ['HS256'],
        })

        return payload as AccessTokenJWTPayload
    } catch (error) {
        console.error('Error verifying JWT:', error)
        return null
    }
}

export async function getSession(): Promise<Session> {
    const cookieStore = await cookies()

    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)

    if (!accessToken || !accessToken.value) {
        return {
            ...UnauthenticatedSession,
            refreshToken: refreshToken?.value ?? null,
        }
    }

    const payload = await getDataFromToken(accessToken.value)

    if (!payload) {
        cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
        return {
            ...UnauthenticatedSession,
            refreshToken: refreshToken?.value ?? null,
        }
    }

    return {
        isAuthenticated: true,
        user: {
            id: payload.id,
            email: payload.email,
            profile_picture: payload.profile_picture,
            first_name: payload.first_name,
            last_name: payload.last_name,
            created_at: payload.created_at,
        },
        accessToken: accessToken.value,
        refreshToken: refreshToken?.value ?? null,
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
    cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME)
}

export async function refreshJWTToken(
    refreshToken: string
): Promise<Tokens | null> {
    try {
        const response = await api.post<
            ApiResponse<{
                tokens: {
                    access_token: string
                    refresh_token: string
                }
            }>
        >('/auth/refresh-token', {
            refresh_token: refreshToken,
        })

        if (!response.data.data) {
            throw new Error('No token was sent from the server')
        }

        const { access_token, refresh_token } = response.data.data.tokens

        await createSession(access_token, refresh_token)

        return {
            accessToken: access_token,
            refreshToken: refresh_token,
        }
    } catch (e) {
        // if we cannot refresh the token, we should let the token expire
        console.error('Error refreshing JWT token:', e)
        return null
    }
}
