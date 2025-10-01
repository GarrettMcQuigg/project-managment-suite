import { db } from '@/packages/lib/prisma/client';
import { SignupRequestBody, SignupRequestBodySchema } from './types';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { handleBadRequest, handleConflict, handleError, handleSuccess } from '@packages/lib/helpers/api-response-handlers';
import { setAuthCookies } from '@/packages/lib/helpers/cookies';
import { CheckEmailAvailability } from '@/packages/lib/helpers/check-email-availability';
import { CreateUserMetrics } from '@/packages/lib/helpers/analytics/user/user-metrics';
import { CreateFreeTierSubscription } from '@/packages/lib/helpers/free-tier-subscription';

export async function POST(request: Request) {
  const requestBody: SignupRequestBody = await request.json();

  requestBody.email = requestBody.email.toLowerCase();

  const { error } = SignupRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    const emailIsAvailable = await CheckEmailAvailability(requestBody.email);
    if (!emailIsAvailable) {
      return handleConflict({
        message: 'Email is already in use',
        err: new Error('Email is already in use')
      });
    }

    const { user, error } = await createNewUser(requestBody);
    if (error) {
      throw error;
    }

    if (!user) {
      throw new Error('Failed to create a new user.');
    }

    const err = await setAuthCookies(user);
    if (err) {
      throw err;
    }

    await CreateFreeTierSubscription(user.id);
    await CreateUserMetrics(user.id);

    return handleSuccess({ message: 'Registered account successfully!' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to signup.';
    return handleError({ message: errorMessage, err });
  }
}

async function createNewUser(requestBody: SignupRequestBody): Promise<{ user: User | null; error: Error | null }> {
  try {
    const hashedPassword = await bcrypt.hash(requestBody.password, 12);
    const user = await db.user.create({
      data: {
        firstname: requestBody.firstname,
        lastname: requestBody.lastname,
        email: requestBody.email,
        phone: requestBody.phone || '',
        password: hashedPassword
      }
    });

    return { user, error: null };
  } catch (err: unknown) {
    console.error('Error: ', err);
    return { user: null, error: new Error('An error occurred while creating a new user.') };
  }
}
