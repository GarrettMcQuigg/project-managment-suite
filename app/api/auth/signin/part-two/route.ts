import { NextRequest } from 'next/server';
import { SigninRequestBody, SigninRequestBodySchema } from '../types';
import { db } from '@/packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess } from '@/packages/lib/helpers/api-response-handlers';
import { setAuthCookies } from '@/packages/lib/helpers/cookies';
import * as bcrypt from 'bcrypt';
import { UpdateUserMetrics } from '@/packages/lib/helpers/analytics/user/user-metrics';

export async function POST(request: NextRequest) {
  const requestBody: SigninRequestBody = await request.json();

  const { error } = SigninRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  if (!process.env.JWT_SECRET) {
    return handleError({ message: 'JWT_SECRET environment variable not set.', err: error });
  }

  try {
    // Check if the user exists
    const user = await db.user.findUnique({
      where: {
        email: requestBody.email
      }
    });

    if (!user) {
      return handleBadRequest({ message: 'Invalid email or password' });
    }

    // Compare submitted password with the hashed password in the database
    const isValidPassword = await bcrypt.compare(requestBody.password, user.password);

    if (!isValidPassword) {
      return handleBadRequest({ message: 'Invalid email or password' });
    }

    const err = await setAuthCookies(user);
    if (err) {
      throw err;
    }

    await UpdateUserMetrics(user.id);

    return handleSuccess({ message: 'Successfully signed in. Welcome home!' });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to signin.', err });
  }
}
