import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';
import { db } from '../prisma/client';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '../constants/cookie-keys';

export async function getCurrentUser(): Promise<User | null> {
  try {
    // TODO : Test
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(TOKEN_COOKIE_KEY);

    const decodedToken = jwt.verify(tokenCookie!.value, process.env.JWT_SECRET!) as { userId: string };

    const userCookie = cookieStore.get(USER_COOKIE_KEY);
    if (!userCookie || userCookie.value === 'undefined') {
      return null;
    }

    const decodedUser = JSON.parse(userCookie.value) as User;
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
  } catch (err: any) {
    return null;
  }
}
