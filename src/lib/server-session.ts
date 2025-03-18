import {
    ACCESS_TOKEN_COOKIE_NAME,
    AccessTokenJWTPayload,
    JWT_SECRET,
    REFRESH_TOKEN_COOKIE_NAME,
    Session,
    UnauthenticatedSession,
} from '@/types/auth'
import * as jose from 'jose'
import { cookies } from 'next/headers'

export async function getServerSession(): Promise<Session> {
    const cookieStore = await cookies()

    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)

    if (!accessToken) {
        return {
            ...UnauthenticatedSession,
            refreshToken: refreshToken?.value ?? null,
        }
    }

    const payload = await getDataFromToken(accessToken.value)

    if (!payload) {
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

async function getDataFromToken(token: string) {
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
