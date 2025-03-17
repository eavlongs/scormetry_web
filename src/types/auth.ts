import { Prettify } from "./general";

export type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
    created_at: Date;
};

export type AccessTokenJWTPayload = Prettify<
    Pick<
        User,
        | "id"
        | "email"
        | "profile_picture"
        | "first_name"
        | "last_name"
        | "created_at"
    > & {
        token_type: "access_token" | "refresh_token";
        iat: number;
        exp: number;
    }
>;

export type RefreshTokenJWTPayload = {};

export const UnauthenticatedSession: Session = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
};

export type Session = {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
};

export type Tokens = {
    accessToken: string;
    refreshToken: string;
};

export const ACCESS_TOKEN_COOKIE_NAME = "access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
export const JWT_SECRET = process.env.JWT_SECRET || "";

// export const ACCESS_TOKEN_LIFETIME = 1000 * 10; // 10 seconds, for testing
export const ACCESS_TOKEN_LIFETIME = 1000 * 60 * 60 * 12; // 12 hours
export const REFRESH_TOKEN_LIFETIME = 1000 * 60 * 60 * 24 * 7; // 7 days
// export const REFRESH_TOKEN_LIFETIME = 1000 * 60; // 1 minute, for testing
