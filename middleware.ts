// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PORTAL_SESSION_COOKIE } from './packages/lib/helpers/portal/portal-session';
import { isUserAuthenticated } from './packages/lib/helpers/portal/is-user-authenticated';
import { handlePortalAccess } from './packages/lib/helpers/portal/handle-portal-access';

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
