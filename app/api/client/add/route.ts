import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AddClientRequestBody, AddClientRequestBodySchema } from './types';
import { UpdateClientMetrics } from '@/packages/lib/helpers/analytics/client/client-metrics';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: AddClientRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = AddClientRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    const client = await db.client.create({
      data: {
        userId: currentUser.id,
        name: requestBody.name,
        email: requestBody.email || '',
        phone: requestBody.phone || '',
        isArchived: false
      }
    });

    await UpdateClientMetrics(currentUser.id);

    return handleSuccess({
      content: client,
      message: 'Successfully Created Client'
    });
  } catch (err) {
    return handleError({ message: 'Failed to create client', err });
  }
}
