import { cookies } from 'next/headers';
import { validatePortalSession, PORTAL_SESSION_COOKIE, getPortalSessionCookieName } from './portal-session';

export interface PortalVisitor {
  id: string;
  name: string;
  projectId: string;
  portalSlug: string;
  createdAt: Date;
}

/**
 * Gets the current portal visitor from the session cookie
 * Uses the new database-backed session system
 * @param projectId - Optional project ID to get a specific project's portal session
 */
export async function getCurrentPortalVisitor(projectId?: string): Promise<PortalVisitor | null> {
  try {
    const cookieStore = await cookies();

    // If projectId is provided, check for that project's specific cookie
    if (projectId) {
      const sessionCookieName = getPortalSessionCookieName(projectId);
      const sessionCookie = cookieStore.get(sessionCookieName);

      if (!sessionCookie?.value) {
        return null;
      }

      const session = await validatePortalSession(sessionCookie.value);

      if (!session) {
        return null;
      }

      // Convert session to PortalVisitor format for backwards compatibility
      return {
        id: session.id,
        name: session.visitorName,
        projectId: session.projectId,
        portalSlug: '', // We'll need to fetch this if needed
        createdAt: session.createdAt
      };
    }

    // If no projectId provided, check all portal session cookies
    // This is for backwards compatibility
    const allCookies = cookieStore.getAll();
    const portalSessionCookies = allCookies.filter(cookie =>
      cookie.name.startsWith(PORTAL_SESSION_COOKIE)
    );

    // Try to validate each portal session cookie until we find a valid one
    for (const cookie of portalSessionCookies) {
      const session = await validatePortalSession(cookie.value);
      if (session) {
        return {
          id: session.id,
          name: session.visitorName,
          projectId: session.projectId,
          portalSlug: '', // We'll need to fetch this if needed
          createdAt: session.createdAt
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Error in getCurrentPortalVisitor:', err);
    return null;
  }
}
