import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { user } from '@prisma/client';
import { db } from '@packages/lib/prisma/client';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '../constants/cookie-keys';
import { ROOT_ROUTE } from '../routes';

const MAX_AGE = 12 * 60 * 60 * 12;

export async function setAuthCookies(user: user): Promise<Error | null> {
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
      secure: false,
      sameSite: 'strict'
    }
  );

  user.password = '[REDACTED]';
  cookieStore.set(USER_COOKIE_KEY, JSON.stringify(user), {
    httpOnly: false,
    maxAge: MAX_AGE,
    path: ROOT_ROUTE,
    secure: false,
    sameSite: 'strict'
  });

  await setOrgCookie(user);

  return null;
}

export async function setOrgCookie(user: user) {
  // const org = await db.organization.findFirst({
  //   where: {
  //     employees: {
  //       some: {
  //         userId: user.id,
  //         organizationRoles: {
  //           some: {}
  //         }
  //       }
  //     }
  //   },
  //   include: OrganizationWithMetadataInclude
  // });
  // if (org) {
  //   cookies().set(ORGANIZATION_COOKIE_KEY, JSON.stringify(org), {
  //     httpOnly: false,
  //     path: ROOT_ROUTE,
  //     secure: false, // This has to be false otherwise we run into issues with Safari.
  //     sameSite: 'strict'
  //   });
  // } else {
  //   cookies().delete(ORGANIZATION_COOKIE_KEY);
  // }
}
