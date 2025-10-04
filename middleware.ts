// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '@/packages/lib/constants/cookie-keys';
import { PORTAL_SESSION_COOKIE } from './packages/lib/helpers/portal-session';

export const config = {
  matcher: [
    // Protected routes (main app routes)
    '/dashboard',
    '/projects',
    '/projects/:path*',
    '/clients/:path*',
    '/invoices/:path*',
    '/calendar/:path*',
    '/project-board/:path*',
    '/settings/:path*',
    '/support/:path*',

    // API routes that require authentication
    '/api/projects/:path*',
    '/api/clients/:path*',
    '/api/invoices/:path*',
    '/api/users/:path*',

    // Portal routes (don't redirect to login, but handle portal access)
    '/projects/:projectId/portal/:slug*'
  ]
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Portal route handling
  const portalMatch = pathname.match(/\/projects\/([^\/]+)\/portal\/([^\/]+)/);
  if (portalMatch) {
    const [, projectId, portalSlug] = portalMatch;
    return handlePortalAccess(request, portalSlug);
  }

  // Verify user is authenticated for all other protected routes
  const isAuthenticated = isUserAuthenticated(request);

  if (!isAuthenticated) {
    // Block portal visitors from accessing non-portal routes
    const portalSessionCookie = request.cookies.get(PORTAL_SESSION_COOKIE);
    if (portalSessionCookie) {
      const errorUrl = new URL('/auth/signin', request.url);
      errorUrl.searchParams.set('error', 'portal_access_denied');
      errorUrl.searchParams.set('message', 'Portal access is restricted to your project portal only');
      return NextResponse.redirect(errorUrl);
    }

    // Redirect to signin
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

function handlePortalAccess(request: NextRequest, portalSlug: string): NextResponse {
  const { pathname } = request.nextUrl;
  const portalSessionCookie = request.cookies.get(PORTAL_SESSION_COOKIE);
  const isAuthenticated = isUserAuthenticated(request);

  // Allow access if portal session exists or user is authenticated
  if (portalSessionCookie || isAuthenticated) {
    return NextResponse.next();
  }

  // Redirect to portal auth
  const authUrl = new URL(`/api/auth/portal/${portalSlug}`, request.url);
  authUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(authUrl);
}

function isUserAuthenticated(request: NextRequest): boolean {
  const tokenCookie = request.cookies.get(TOKEN_COOKIE_KEY);
  const userCookie = request.cookies.get(USER_COOKIE_KEY);

  if (!tokenCookie?.value || !userCookie?.value || userCookie.value === 'undefined') {
    return false;
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable not set');
    return false;
  }

  try {
    // Parse JWT payload (base64 decode the middle part)
    const parts = tokenCookie.value.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }

    if (!payload.userId) {
      return false;
    }

    // Check user cookie structure
    const user = JSON.parse(userCookie.value);
    if (!user.id || !user.email) {
      return false;
    }

    // Verify the user ID in the token matches the user cookie
    if (payload.userId !== user.id) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}
