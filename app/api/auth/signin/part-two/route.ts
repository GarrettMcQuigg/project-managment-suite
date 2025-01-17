import { NextRequest } from 'next/server';
import { SigninRequestBody, SigninRequestBodySchema } from '../types';
import { db } from '@/packages/lib/prisma/client';

export async function POST(request: NextRequest) {
  const requestBody: SigninRequestBody = await request.json();

  const { error } = SigninRequestBodySchema.validate(requestBody);
  if (error) {
    // return handleBadRequest({ message: error.message, err: error });
  }

  if (!process.env.JWT_SECRET) {
    // return handleError({ message: 'JWT_SECRET environment variable not set.', err: error });
  }

  try {
    // Check if the user exists
    const user = await db.user.findUnique({
      where: {
        email: requestBody.email
      }
    });

    // if (!user) {
    //   return handleBadRequest({ message: 'Invalid email or password' });
    // }

    // Compare submitted password with the hashed password in the database
    // const isValidPassword = await bcrypt.compare(requestBody.password, user.password);

    // if (!isValidPassword) {
    //   return handleBadRequest({ message: 'Invalid email or password' });
    // }

    // let err = await twilioService.checkVerificationCode(user.phone, requestBody.smsMFACode);
    // if (err) {
    //   throw err;
    // }

    // err = await setAuthCookies(user);
    // if (err) {
    //   throw err;
    // }

    return 'hell yeah brother';
    // return handleSuccess({ message: 'Welcome back!!' });
  } catch (err: any) {
    // return handleError({ message: 'Failed to signin.', err });
  }
}
