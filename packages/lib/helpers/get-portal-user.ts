import { cookies } from 'next/headers';
import { validatePortalSession, PORTAL_SESSION_COOKIE } from './portal-session';

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
 */
export async function getCurrentPortalVisitor(): Promise<PortalVisitor | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(PORTAL_SESSION_COOKIE);

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
  } catch (err) {
    console.error('Error in getCurrentPortalVisitor:', err);
    return null;
  }
}
