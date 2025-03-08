import { cookies } from 'next/headers';

export const PORTAL_SESSION_COOKIE = 'portal_session';
export const PORTAL_VISITOR_COOKIE = 'portal_visitor';

export interface PortalVisitor {
  id: string;
  name: string;
  projectId: string;
  portalSlug: string;
  createdAt: Date;
}

export async function getCurrentPortalVisitor(): Promise<PortalVisitor | null> {
  try {
    const cookieStore = await cookies();
    const portalSessionCookie = cookieStore.get(PORTAL_SESSION_COOKIE);
    const portalVisitorCookie = cookieStore.get(PORTAL_VISITOR_COOKIE);

    if (!portalSessionCookie?.value || !portalVisitorCookie?.value) {
      return null;
    }

    try {
      const portalSession = JSON.parse(portalSessionCookie.value);
      const portalVisitor = JSON.parse(portalVisitorCookie.value);

      // Garrett TODO : Move 'portal_' to a constant and import it
      if (!portalSession.authorized || !portalVisitor.id.startsWith('portal_')) {
        return null;
      }

      return portalVisitor as PortalVisitor;
    } catch (error) {
      console.error('Error parsing portal visitor data:', error);
      return null;
    }
  } catch (err) {
    console.error('Error in getCurrentPortalVisitor:', err);
    return null;
  }
}
