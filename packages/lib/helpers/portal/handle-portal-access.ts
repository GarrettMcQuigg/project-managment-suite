import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_SESSION_COOKIE, PORTAL_PROJECT_COOKIE } from './portal-session';
import { isUserAuthenticated } from './is-user-authenticated';

export function handlePortalAccess(request: NextRequest, projectId: string, portalSlug: string): NextResponse {
  const { pathname } = request.nextUrl;
  const portalSessionCookie = request.cookies.get(PORTAL_SESSION_COOKIE);
  const portalProjectCookie = request.cookies.get(PORTAL_PROJECT_COOKIE);
  const isAuthenticated = isUserAuthenticated(request);

  // Validate portal session matches the project
  if (portalSessionCookie && portalProjectCookie) {
    const cookieProjectId = portalProjectCookie.value;

    // If cookie projectId matches URL projectId, allow access
    if (cookieProjectId === projectId) {
      return NextResponse.next();
    }

    // Session exists but doesn't match this project - redirect to auth
    const authUrl = new URL(`/api/auth/portal/${portalSlug}`, request.url);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }

  // Allow access if user is authenticated (main app user)
  if (isAuthenticated) {
    return NextResponse.next();
  }

  // No valid session - redirect to portal auth
  const authUrl = new URL(`/api/auth/portal/${portalSlug}`, request.url);
  authUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(authUrl);
}
