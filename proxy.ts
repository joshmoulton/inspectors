import { auth } from './auth';
import { NextResponse } from 'next/server';

// Routes that inspectors cannot access
const RESTRICTED_FOR_INSPECTOR = ['/users', '/utilities', '/api/import/cleanup'];

// Public routes that don't require auth
const PUBLIC_ROUTES = ['/login', '/api/auth', '/client-portal', '/api/client-portal'];

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static assets and Next.js internals
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Check authentication
    if (!req.auth) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRole = (req.auth.user as any)?.role || 'inspector';

    // Restrict inspector access to admin routes
    if (userRole === 'inspector' && RESTRICTED_FOR_INSPECTOR.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/orders', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
