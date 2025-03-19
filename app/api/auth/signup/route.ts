import { db } from '@/packages/lib/prisma/client';
import { SignupRequestBody, SignupRequestBodySchema } from './types';
import * as bcrypt from 'bcrypt';
// import { codeHasExpired } from '@packages/lib/services/email-service/templates/verify-email';
// // import TwilioService from '@packages/lib/services/twilio-service/twilio-service';
import { User } from '@prisma/client';
import { handleBadRequest, handleConflict, handleError, handleSuccess } from '@packages/lib/helpers/api-response-handlers';
import { setAuthCookies } from '@/packages/lib/helpers/cookies';
import { CheckEmailAvailability } from '@/packages/lib/helpers/check-email-availability';
import { CreateUserMetrics } from '@/packages/lib/helpers/analytics/user/user-metrics';

// const twilioService = new TwilioService();

export async function POST(request: Request) {
  const requestBody: SignupRequestBody = await request.json();

  requestBody.email = requestBody.email.toLowerCase();

  const { error } = SignupRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  // if (requestBody.phone !== '+19132231730') {
  // return handleError({ message: 'Registration is currently invite-only.' });
  // }

  try {
    // let err = await verifyEmailCode(requestBody.email, requestBody.emailMFACode);
    // if (err) {
    //   throw err;
    // }

    // err = await verifyPhoneCode(requestBody.phone, requestBody.smsMFACode);
    // if (err) {
    //   throw err;
    // }

    // await db.emailMFASession.delete({
    //   where: {
    //     email: requestBody.email
    //   }
    // });

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

    await CreateUserMetrics(user.id);

    return handleSuccess({ message: 'Registered account successfully!' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to signup.';
    return handleError({ message: errorMessage, err });
  }
}

// async function verifyEmailCode(email: string, code: string): Promise<Error | null> {
//   try {
//     const session = await db.emailMFASession.findUnique({
//       where: {
//         email
//       }
//     });

//     if (!session) {
//       return new Error('No MFA session found for the email.');
//     }

//     if (session.code !== code.toUpperCase()) {
//       return new Error('Invalid MFA code.');
//     }

//     if (codeHasExpired(session.createdAt)) {
//       await db.emailMFASession.delete({
//         where: {
//           email
//         }
//       });

//       return new Error('MFA code has expired.');
//     }

//     return null;
//   } catch (err: any) {
//     console.error('Error: ', err);
//     return new Error('An error occurred while verifying the email code.');
//   }
// }

// async function verifyPhoneCode(phone: string, code: string): Promise<Error | null> {
//   const err = await twilioService.checkVerificationCode(phone, code);
//   if (err) {
//     return new Error(err.message);
//   }

//   return null;
// }

async function createNewUser(requestBody: SignupRequestBody): Promise<{ user: User | null; error: Error | null }> {
  try {
    const hashedPassword = await bcrypt.hash(requestBody.password, 10);
    const user = await db.user.create({
      data: {
        firstname: requestBody.firstname,
        lastname: requestBody.lastname,
        email: requestBody.email,
        phone: requestBody.phone,
        password: hashedPassword,
        subscriptionStatus: 'VISIONARY'
      }
    });

    return { user, error: null };
  } catch (err: unknown) {
    console.error('Error: ', err);
    return { user: null, error: new Error('An error occurred while creating a new user.') };
  }
}
