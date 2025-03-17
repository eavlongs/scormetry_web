import { google } from "@/lib/auth";
import { decodeIdToken } from "arctic";
import { cookies } from "next/headers";

import { api } from "@/lib/axios";
import { createSession } from "@/lib/session";
import { User } from "@/types/auth";
import { ApiResponse } from "@/types/response";
import type { OAuth2Tokens } from "arctic";
import {
    GOOGLE_CODE_VERIFIER_COOKIE_NAME,
    GOOGLE_OAUTH_STATE_COOKIE_NAME,
    REDIRECT_URL_COOKIE_NAME,
} from "../route";

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const storedState =
        cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE_NAME)?.value ?? null;
    const codeVerifier =
        cookieStore.get(GOOGLE_CODE_VERIFIER_COOKIE_NAME)?.value ?? null;
    if (
        code === null ||
        state === null ||
        storedState === null ||
        codeVerifier === null
    ) {
        return new Response(null, {
            status: 400,
        });
    }
    if (state !== storedState) {
        return new Response(null, {
            status: 400,
        });
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        // Invalid code or client credentials
        return new Response(null, {
            status: 400,
        });
    }
    const claims = decodeIdToken(tokens.idToken()) as GoogleUser;
    // console.log(claims);
    let response;

    try {
        response = await api.post<
            ApiResponse<{
                tokens: {
                    access_token: string;
                    refresh_token: string;
                };
            }>
        >("/auth/login", {
            sub: claims.sub,
            email: claims.email,
            first_name: claims.given_name,
            last_name: claims.family_name,
            profile_picture: claims.picture,
        });
    } catch (e: any) {
        const urlSearchParams = new URLSearchParams("/login");
        urlSearchParams.append("error", e.response.message);

        return new Response(null, {
            status: 400,
            headers: {
                Location: urlSearchParams.toString(),
            },
        });
    }

    try {
        await createSession(
            response.data.data.tokens.access_token,
            response.data.data.tokens.refresh_token
        );
    } catch (e) {
        return new Response(null, {
            status: 400,
            headers: {
                Location: "/login",
            },
        });
    }

    const redirectUrl = cookieStore.get(REDIRECT_URL_COOKIE_NAME)?.value ?? "/";
    cookieStore.delete("redirect_url");
    cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE_NAME);
    cookieStore.delete(GOOGLE_CODE_VERIFIER_COOKIE_NAME);

    return new Response(null, {
        status: 302,
        headers: {
            Location: redirectUrl,
        },
    });
}

type GoogleUser = {
    sub: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    // email_verified: boolean;
    // hd: string;
};
