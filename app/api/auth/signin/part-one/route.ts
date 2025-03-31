import { db } from '@packages/lib/prisma/client';
import bcrypt from 'bcrypt';
import { SigninRequestBody, SigninRequestBodySchema } from '../types';
import { handleBadRequest, handleError, handleSuccess } from '@packages/lib/helpers/api-response-handlers';
import TwilioService from '@/packages/lib/utils/twilio/twilio-service';

const twilioService = new TwilioService();

export async function POST(request: Request) {
  const requestBody: SigninRequestBody = await request.json();

  const { error } = SigninRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  if (!process.env.JWT_SECRET) {
    return handleError({ message: 'JWT_SECRET environment variable not set.', err: error });
  }

  try {
    const user = await db.user.findUnique({
      where: {
        email: requestBody.email
      }
    });

    if (!user) {
      return handleBadRequest({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(requestBody.password, user.password);

    if (!isValidPassword) {
      return handleBadRequest({ message: 'Invalid email or password' });
    }

    const err = await twilioService.sendVerificationCode(user.phone);
    if (err) {
      throw err;
    }

    return handleSuccess({ message: 'Verification code sent!' });
  } catch (err: unknown) {
    return handleError({ message: 'An error occurred. Please try again later.', err });
  }
}
