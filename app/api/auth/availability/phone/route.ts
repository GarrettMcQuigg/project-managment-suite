import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleConflict, handleError, handleSuccess } from '@packages/lib/helpers/api-response-handlers';
import { SignupAvailabilityPhoneRequestBody, SignupAvailabilityPhoneRequestBodySchema } from './type';

export async function POST(request: Request) {
  const requestBody: SignupAvailabilityPhoneRequestBody = await request.json();

  const { error } = SignupAvailabilityPhoneRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    const existingUsers = await db.user.findMany({
      where: {
        phone: requestBody.phone
      }
    });

    if (existingUsers.length > 3) {
      return handleConflict({ message: 'The same phone number can only be used on 3 different accounts.' });
    }

    return handleSuccess({ message: 'Phone number is available.' });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to check phone number availability.', err });
  }
}
