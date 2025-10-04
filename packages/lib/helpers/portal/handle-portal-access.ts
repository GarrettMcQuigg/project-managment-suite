import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_SESSION_COOKIE } from './portal-session';
import { isUserAuthenticated } from './is-user-authenticated';

export function handlePortalAccess(request: NextRequest, portalSlug: string): NextResponse {
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
