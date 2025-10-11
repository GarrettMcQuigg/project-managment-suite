import { NextRequest, NextResponse } from 'next/server';
import { getPortalSessionCookieName, getPortalProjectCookieName } from './portal-session';
import { isUserAuthenticated } from './is-user-authenticated';

export function handlePortalAccess(request: NextRequest, projectId: string, portalSlug: string): NextResponse {
  const { pathname } = request.nextUrl;
  const sessionCookieName = getPortalSessionCookieName(projectId);
  const projectCookieName = getPortalProjectCookieName(projectId);
  const portalSessionCookie = request.cookies.get(sessionCookieName);
  const portalProjectCookie = request.cookies.get(projectCookieName);
  const isAuthenticated = isUserAuthenticated(request);

  // Validate portal session matches the project
  if (portalSessionCookie && portalProjectCookie) {
    const cookieProjectId = portalProjectCookie.value;

    // If cookie projectId matches URL projectId, allow access
    if (cookieProjectId === projectId) {
      return NextResponse.next();
    }

    // Session exists but doesn't match this project - redirect to auth
    const authUrl = new URL('/auth/portal/signin', request.url);
    authUrl.searchParams.set('slug', portalSlug);
    authUrl.searchParams.set('projectId', projectId);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }

  // Allow access if user is authenticated (main app user)
  if (isAuthenticated) {
    return NextResponse.next();
  }

  // No valid session - redirect to portal signin
  const authUrl = new URL('/auth/portal/signin', request.url);
  authUrl.searchParams.set('slug', portalSlug);
  authUrl.searchParams.set('projectId', projectId);
  authUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(authUrl);
}
