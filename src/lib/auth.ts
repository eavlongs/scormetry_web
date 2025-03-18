import { Google } from 'arctic'

const appUrl = process.env.APP_URL
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!appUrl || !googleClientId || !googleClientSecret) {
    throw new Error(
        'Please set the GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and APP_URL environment variables.'
    )
}

export const google = new Google(
    googleClientId,
    googleClientSecret,
    appUrl + '/login/google/callback'
)
