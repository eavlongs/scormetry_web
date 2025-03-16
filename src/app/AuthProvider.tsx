"use client";

import { getDataFromToken, getSession, refreshJWTToken } from "@/lib/session";
import {
    REFRESH_TOKEN_LIFETIME,
    Session,
    UnauthenticatedSession,
} from "@/types/auth";
import { createContext, ReactNode, useEffect, useState } from "react";

export const AuthContext = createContext<Session>(UnauthenticatedSession);

export default function AuthProvider({
    children,
}: {
    children: Readonly<ReactNode>;
}) {
    const [session, setSession] = useState<Session>(UnauthenticatedSession);
    const [sessionFetched, setSessionFetched] = useState(false);

    useEffect(() => {
        async function fetchSession() {
            if (!sessionFetched) {
                const session = await getSession();
                setSession(session);
                setSessionFetched(true);
            }
        }

        async function handleRefreshSession() {
            if (sessionFetched && session.refreshToken) {
                if (!session.isAuthenticated) {
                    console.log("Refreshing because unauthenticated");
                    await refreshSession();
                } else {
                    const refreshToken = await getDataFromToken(
                        session.refreshToken
                    );
                    if (!refreshToken) {
                        // if refresh token is invalid, do nothing
                        return;
                    }

                    const refreshTokenExpiry = new Date(
                        refreshToken.exp * 1000
                    );
                    // if the refresh token expiry is less than half of its lifetime

                    console.log(
                        "Refreshing because refresh token expiry is less than half of its lifetime"
                    );

                    if (
                        refreshTokenExpiry <
                        new Date(
                            new Date().getTime() + REFRESH_TOKEN_LIFETIME / 2
                        )
                    ) {
                        // then we should refresh the token
                        refreshSession();
                    }
                }
            }
        }

        async function refreshSession() {
            const tokens = await refreshJWTToken(session?.refreshToken ?? "");

            if (tokens) {
                // if refresh is successful, update the session
                setSessionFetched(false);
            }
        }

        fetchSession();
        handleRefreshSession();
    }, [sessionFetched]);

    return (
        <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
    );
}
