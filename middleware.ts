import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '@/packages/lib/constants/cookie-keys';
import jwt from 'jsonwebtoken';

export const config = {
  matcher: ['/projects/:projectId/portal/:slug*']
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const portalMatch = pathname.match(/\/projects\/([^\/]+)\/portal\/([^\/]+)/);

  if (!portalMatch) {
    return NextResponse.next();
  }

  const [, projectId, portalSlug] = portalMatch;

  // Check if user has a portal access cookie for this specific portal
  const portalAccessCookie = request.cookies.get(`portal_access_${portalSlug}`);
  if (portalAccessCookie) {
    // Valid portal access cookie - create portal session
    try {
      const portalUser = {
        id: `portal_${projectId}`,
        email: `portal@${portalSlug}`,
        name: 'Portal Visitor',
        isPortalUser: true,
        portalProjectId: projectId,
        portalSlug: portalSlug
      };

      const response = NextResponse.next();

      response.cookies.set(
        'portal_session',
        JSON.stringify({
          projectId,
          slug: portalSlug,
          authorized: true
        }),
        {
          httpOnly: true,
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        }
      );

      response.cookies.set(USER_COOKIE_KEY, JSON.stringify(portalUser), {
        httpOnly: false,
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      return response;
    } catch (error) {
      console.error('Portal session creation error:', error);
      const authUrl = new URL(`/api/auth/portal/${portalSlug}`, request.url);
      authUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  // User doesn't have portal access cookie
  // Check if they have a regular auth token
  const tokenCookie = request.cookies.get(TOKEN_COOKIE_KEY);
  const userCookie = request.cookies.get(USER_COOKIE_KEY);

  if (tokenCookie && userCookie) {
    // User is logged in, but we need to verify if they own this project
    // We'll handle this in the page component since we can't safely parse JWT in middleware
    // Just let them through - the page component will check project ownership
    return NextResponse.next();
  }

  // No valid access - redirect to portal auth
  const authUrl = new URL(`/api/auth/portal/${portalSlug}`, request.url);
  authUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(authUrl);
}
