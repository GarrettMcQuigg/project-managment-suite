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
    const userCookie = cookieStore.get(USER_COOKIE_KEY);

    if (tokenCookie?.value && userCookie?.value && userCookie.value !== 'undefined') {
      // Regular auth flow
      try {
        const decodedToken = jwt.verify(tokenCookie.value, process.env.JWT_SECRET!) as { userId: string };
        const decodedUser = JSON.parse(userCookie.value);

        // Check if the token is valid for this user
        if (decodedUser.id !== decodedToken.userId) {
          // Token mismatch, try portal flow
          throw new Error('Token mismatch');
        }

        // Get the user from the database
        const user = await db.user.findUnique({
          where: {
            id: decodedToken.userId,
            email: decodedUser.email
          }
        });

        if (!user) {
          // User not found, try portal flow
          throw new Error('User not found');
        }

        return user;
      } catch (error) {
        // If regular auth fails, fall through to portal auth
        console.log('Regular auth failed, trying portal auth');
      }
    }

    // Check for portal session
    const portalSessionCookie = cookieStore.get('portal_session');

    if (portalSessionCookie?.value && userCookie?.value) {
      try {
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
      } catch (error) {
        console.error('Portal auth failed:', error);
      }
    }

    return null;
  } catch (err: any) {
    console.error('Error in getCurrentUser:', err);
    return null;
  }
}
