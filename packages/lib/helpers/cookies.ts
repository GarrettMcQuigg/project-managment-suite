import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '../constants/cookie-keys';
import { ROOT_ROUTE } from '../routes';

const MAX_AGE = 12 * 60 * 60 * 12;

export async function setAuthCookies(user: User): Promise<Error | null> {
  if (!process.env.JWT_SECRET) {
    return new Error('JWT_SECRET environment variable not set.');
  }

  const cookieStore = await cookies();

  cookieStore.set(
    TOKEN_COOKIE_KEY,
    jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '12d'
    }),
    {
      httpOnly: true,
      maxAge: MAX_AGE,
      path: ROOT_ROUTE,
      // TODO : Test on Safari
      // secure: false, // This has to be false otherwise we run into issues with Safari.
      sameSite: 'strict'
    }
  );

  user.password = '[REDACTED]';
  cookieStore.set(USER_COOKIE_KEY, JSON.stringify(user), {
    httpOnly: false,
    maxAge: MAX_AGE,
    path: ROOT_ROUTE,
    // TODO : Test on Safari
    // secure: false, // This has to be false otherwise we run into issues with Safari.
    sameSite: 'strict'
  });

  return null;
}
