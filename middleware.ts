// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '@/packages/lib/constants/cookie-keys';
import { PORTAL_SESSION_COOKIE, PORTAL_VISITOR_COOKIE } from './packages/lib/helpers/get-portal-user';

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

  // Check if this is a portal route
  const portalMatch = pathname.match(/\/projects\/([^\/]+)\/portal\/([^\/]+)/);
  const isPortalRoute = !!portalMatch;

  // If this is a portal route, handle portal access logic
  if (isPortalRoute) {
    const [, projectId, portalSlug] = portalMatch!;
    return handlePortalAccess(request, projectId, portalSlug);
  }

  // For all other protected routes, verify the user is authenticated
  const isAuthenticated = isUserAuthenticated(request);

  if (!isAuthenticated) {
    // Check if there's a portal visitor
    const portalVisitorCookie = request.cookies.get(PORTAL_VISITOR_COOKIE);

    if (portalVisitorCookie) {
      try {
        // Portal visitors can't access protected routes, redirect to portal
        const portalVisitor = JSON.parse(portalVisitorCookie.value);
        const portalUrl = `/projects/${portalVisitor.projectId}/portal/${portalVisitor.portalSlug}`;
        return NextResponse.redirect(new URL(portalUrl, request.url));
      } catch (e) {
        // If error parsing cookie, redirect to login
        console.error('Error parsing portal visitor cookie:', e);
      }
    }

    // Redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

function handlePortalAccess(request: NextRequest, projectId: string, portalSlug: string): NextResponse {
  const { pathname } = request.nextUrl;

  // Check if user has portal access cookie
  const portalAccessCookie = request.cookies.get(`portal_access_${portalSlug}`);

  // Check if user is already logged in
  const isAuthenticated = isUserAuthenticated(request);

  if (portalAccessCookie) {
    // User has portal access, let them through
    return NextResponse.next();
  }

  // No valid access for portal yet

  if (isAuthenticated) {
    // User is logged in, they can view the portal if they own the project
    // The page component will check project ownership
    return NextResponse.next();
  }

  // No valid access - redirect to portal auth
  const authUrl = new URL(`/api/auth/portal/${portalSlug}`, request.url);
  authUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(authUrl);
}

/**
 * Checks if the user is authenticated
 */
function isUserAuthenticated(request: NextRequest): boolean {
  const tokenCookie = request.cookies.get(TOKEN_COOKIE_KEY);
  const userCookie = request.cookies.get(USER_COOKIE_KEY);

  if (!tokenCookie?.value || !userCookie?.value || userCookie.value === 'undefined') {
    return false;
  }

  try {
    // We can't fully verify the token in middleware, but we can check basic structure
    const tokenParts = tokenCookie.value.split('.');
    if (tokenParts.length !== 3) {
      return false;
    }

    // Do basic check on user cookie
    const user = JSON.parse(userCookie.value);
    if (!user.id || !user.email) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}
