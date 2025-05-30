import { REDIRECT_URL_NAME } from '@/types/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from './lib/server-session'

export async function middleware(request: NextRequest) {
    console.log({
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for'),
        timestamp: new Date().toISOString(),
    })

    const { pathname } = request.nextUrl
    const session = await getServerSession()

    if (
        !session.isAuthenticated &&
        !session.refreshToken &&
        !pathname.startsWith('/login')
    ) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set(REDIRECT_URL_NAME, pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (
        pathname === '/login' &&
        (session.isAuthenticated || session.refreshToken)
    ) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}
