'use client'

import {
    getDataFromToken,
    getSession,
    logout,
    refreshJWTToken,
} from '@/lib/session'
import {
    REFRESH_TOKEN_LIFETIME,
    Session,
    UnauthenticatedSession,
} from '@/types/auth'
import { createContext, ReactNode, useEffect, useState } from 'react'

export type AuthContextType = Session & {
    loading: boolean
}

const authContextDefaultValue = {
    ...UnauthenticatedSession,
    loading: true,
}

export const AuthContext = createContext<AuthContextType>(
    authContextDefaultValue
)

export default function AuthProvider({
    children,
}: {
    children: Readonly<ReactNode>
}) {
    const [session, setSession] = useState<AuthContextType>(
        authContextDefaultValue
    )
    const [sessionFetched, setSessionFetched] = useState(false)

    useEffect(() => {
        async function fetchSession() {
            if (!sessionFetched) {
                const session = await getSession()
                setSession({
                    ...session,
                    loading: false,
                })
                setSessionFetched(true)
            }
        }

        async function handleRefreshSession() {
            console.log({
                sessionFetched,
                refreshToken: session.refreshToken,
            })
            if (!(sessionFetched && session.refreshToken)) {
                return
            }

            if (!session.isAuthenticated) {
                console.log('Refreshing because unauthenticated')
                await refreshSession()
            } else {
                const refreshToken = await getDataFromToken(
                    session.refreshToken
                )
                if (!refreshToken) {
                    // if refresh token is invalid, do nothing
                    return
                }

                const refreshTokenExpiry = new Date(refreshToken.exp * 1000)
                // if the refresh token expiry is less than half of its lifetime

                if (
                    refreshTokenExpiry <
                    new Date(new Date().getTime() + REFRESH_TOKEN_LIFETIME / 2)
                ) {
                    console.log(
                        'Refreshing because refresh token expiry is less than half of its lifetime'
                    )
                    // then we should refresh the token
                    refreshSession()
                }
            }
        }

        async function refreshSession() {
            const tokens = await refreshJWTToken(session.refreshToken ?? '')

            if (tokens) {
                // if refresh is successful, update the session
                setSessionFetched(false)
            } else if (!session.accessToken) {
                await logout()
                window.location.reload()
            }
        }

        fetchSession()
        handleRefreshSession()
    }, [sessionFetched])

    return (
        <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
    )
}
