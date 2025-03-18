import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from './lib/server-session'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const session = await getServerSession()

    if (
        !session.isAuthenticated &&
        !session.refreshToken &&
        !pathname.startsWith('/login')
    ) {
        return NextResponse.redirect(new URL('/login', request.url))
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
