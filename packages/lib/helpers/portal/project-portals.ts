import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { db } from '../../prisma/client';

// Re-export client-safe functions
export { generateSecurePassword, generatePortalSlug, generateUniquePortalId } from './password-generator';

/**
 * Validates if a user or portal visitor has access to a project
 * @deprecated Use validatePortalSessionForProject from portal-session.ts instead
 */
export async function validateProjectAccess(
  projectId: string,
  portalSlug: string | null,
  userId: string | null | undefined,
  projectOwnerId: string,
  cookieStore?: ReadonlyRequestCookies | RequestCookies
): Promise<boolean> {
  // If the user is the owner, they always have access
  if (userId && userId === projectOwnerId) {
    return true;
  }

  // If no portal slug exists, only the owner can access
  if (!portalSlug) {
    return false;
  }

  // Get cookie store
  const cookieJar = cookieStore || (await cookies());

  // Check for portal session using new session system
  const { validatePortalSessionForProject, PORTAL_SESSION_COOKIE } = await import('./portal-session');
  const sessionCookie = cookieJar.get(PORTAL_SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return false;
  }

  const session = await validatePortalSessionForProject(sessionCookie.value, projectId);
  return !!session;
}

export async function hasPortalAccess(projectId: string, userId: string | null, portalSlug: string | null): Promise<boolean> {
  if (!portalSlug) {
    return false;
  }

  if (userId) {
    try {
      const project = await db.project.findUnique({
        where: {
          id: projectId,
          userId,
          portalEnabled: true
        }
      });

      if (project) {
        return true;
      }
    } catch (error) {
      console.error('Error checking project ownership:', error);
    }
  }

  return false;
}
