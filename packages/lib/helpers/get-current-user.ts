import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';
import { db } from '../prisma/client';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '../constants/cookie-keys';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(TOKEN_COOKIE_KEY);
  const userCookie = cookieStore.get(USER_COOKIE_KEY);

  if (!tokenCookie?.value || !userCookie?.value || userCookie.value === 'undefined') {
    return null;
  }

  try {
    const decodedToken = jwt.verify(tokenCookie.value, process.env.JWT_SECRET!) as { userId: string };
    const decodedUser = JSON.parse(userCookie.value);

    if (decodedUser.id !== decodedToken.userId) {
      return null;
    }

    const user = await db.user.findUnique({
      where: {
        id: decodedToken.userId,
        email: decodedUser.email
      }
    });

    return user;
  } catch (error) {
    console.error('Error verifying user token:', error);
    return null;
  }
}
