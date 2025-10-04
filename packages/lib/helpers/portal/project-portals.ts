import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { db } from '../../prisma/client';

export function generateSecurePassword(): string {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '@#$%&*!?';

  const getRandomChars = (charSet: string, count: number) => {
    return Array.from({ length: count }, () => charSet[Math.floor(Math.random() * charSet.length)]).join('');
  };

  const parts = [getRandomChars(upperChars, 2), getRandomChars(numbers, 2), getRandomChars(lowerChars, 2), getRandomChars(specialChars, 2)];

  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join('');
}

export function generatePortalSlug(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  const randomString = Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');

  return randomString;
}

export async function generateUniquePortalId(): Promise<string> {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [8, 4, 4, 4, 12];

  const randomChars = Array.from({ length: segments.reduce((a, b) => a + b, 0) }, () => characters[Math.floor(Math.random() * characters.length)]);

  let position = 0;
  const formattedToken = segments
    .map((segmentLength) => {
      const segment = randomChars.slice(position, position + segmentLength).join('');
      position += segmentLength;
      return segment;
    })
    .join('-');

  return formattedToken;
}

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
