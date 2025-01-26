import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { UpdateClientRequestBody, UpdateClientRequestBodySchema } from './types';

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: UpdateClientRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = UpdateClientRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    const client = await db.client.update({
      where: { id: requestBody.id },
      data: {
        name: requestBody.name,
        email: requestBody.email,
        phone: requestBody.phone
      }
    });

    return handleSuccess({
      content: client,
      message: 'Successfully Updated Client'
    });
  } catch (err) {
    return handleError({ message: 'Failed to update client', err });
  }
}
