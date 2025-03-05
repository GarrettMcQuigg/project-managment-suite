import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';
import { db } from '../prisma/client';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '../constants/cookie-keys';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();

    // Check for regular token first
    const tokenCookie = cookieStore.get(TOKEN_COOKIE_KEY);

    if (tokenCookie?.value) {
      // Regular auth flow
      const decodedToken = jwt.verify(tokenCookie.value, process.env.JWT_SECRET!) as { userId: string };

      const userCookie = cookieStore.get(USER_COOKIE_KEY);
      if (!userCookie || userCookie.value === 'undefined') {
        return null;
      }

      const decodedUser = JSON.parse(userCookie.value);

      if (decodedUser.id !== decodedToken.userId) {
        return null;
      }

      const user = await db.user.findUniqueOrThrow({
        where: {
          id: decodedToken.userId,
          email: decodedUser.email
        }
      });

      return user;
    }

    // Check for portal session
    const portalSessionCookie = cookieStore.get('portal_session');
    const userCookie = cookieStore.get(USER_COOKIE_KEY);

    if (portalSessionCookie?.value && userCookie?.value) {
      const portalSession = JSON.parse(portalSessionCookie.value);
      const decodedUser = JSON.parse(userCookie.value);

      if (portalSession.authorized && decodedUser.isPortalUser) {
        // Return a User-compatible object for portal sessions
        return {
          id: decodedUser.id,
          email: decodedUser.email,
          name: decodedUser.name,
          // Add minimal required User properties
          createdAt: new Date(),
          updatedAt: new Date(),
          password: '', // Add an empty password field to match User type
          // Add special portal properties
          _portalAccess: true,
          _portalProjectId: portalSession.projectId,
          _portalSlug: portalSession.slug
        } as unknown as User;
      }
    }

    return null;
  } catch (err: any) {
    return null;
  }
}
