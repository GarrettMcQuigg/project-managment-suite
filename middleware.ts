import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/projects/:projectId/portal/:slug*']
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract the portal slug from the URL
  const portalSlugMatch = pathname.match(/\/projects\/[^\/]+\/portal\/([^\/]+)/);

  if (portalSlugMatch) {
    const portalSlug = portalSlugMatch[1];
    const hasAccess = request.cookies.get(`portal_access_${portalSlug}`);

    if (!hasAccess) {
      // Redirect to the auth page with the portal slug
      const authUrl = new URL(`/api/auth/portal/${portalSlug}`, request.url);

      // Save the original URL as a redirect parameter
      authUrl.searchParams.set('redirect', pathname);

      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}
