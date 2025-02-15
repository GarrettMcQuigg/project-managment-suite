import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/projects/:projectId/portal/:slug']
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const portalSlugMatch = pathname.match(/\/projects\/[^\/]+\/portal\/([^\/]+)/);

  if (portalSlugMatch) {
    const portalSlug = portalSlugMatch[1];
    const hasAccess = request.cookies.get(`portal_access_${portalSlug}`);

    if (!hasAccess) {
      // Construct the authentication page URL
      // This should point to your portal authentication page
      const authUrl = new URL(`/portal/auth/${portalSlug}`, request.url);

      // Preserve the original URL as a redirect parameter
      authUrl.searchParams.set('redirect', pathname);

      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}
