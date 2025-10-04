import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_SESSION_COOKIE } from './portal-session';
import { isUserAuthenticated } from './is-user-authenticated';

export function handlePortalAccess(request: NextRequest, projectId: string, portalSlug: string): NextResponse {
  const { pathname } = request.nextUrl;
  const portalSessionCookie = request.cookies.get(PORTAL_SESSION_COOKIE);
  const isAuthenticated = isUserAuthenticated(request);

  let invalidProjectId = false;
  // TODO : Fix portal session user's being able to access other project portals
  // if (portalSessionCookie) {
  //   const projectName = portalSessionCookie.value;

  //   if (projectName !== projectId) {
  //     invalidProjectId = true;
  //   }
  // }

  // Allow access if portal session exists or user is authenticated
  if ((portalSessionCookie || isAuthenticated) && !invalidProjectId) {
    return NextResponse.next();
  }

  // Redirect to portal auth
  const authUrl = new URL(`/api/auth/portal/${portalSlug}`, request.url);
  authUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(authUrl);
}
