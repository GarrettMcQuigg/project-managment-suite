import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleConflict, handleError, handleSuccess } from '@packages/lib/helpers/api-response-handlers';
import { SignupAvailabilityEmailRequestBody, SignupAvailabilityEmailRequestBodySchema } from './type';

export async function POST(request: Request) {
  const requestBody: SignupAvailabilityEmailRequestBody = await request.json();

  const { error } = SignupAvailabilityEmailRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    const existingUser = await db.user.findUnique({
      where: {
        email: requestBody.email
      }
    });

    if (existingUser) {
      return handleConflict({ message: 'Email address is already in use' });
    }

    return handleSuccess({ message: 'Email address is available' });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to check email availability.', err });
  }
}
