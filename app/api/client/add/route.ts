import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AddClientRequestBody, AddClientRequestBodySchema } from './types';
import { UpdateClientMetrics } from '@/packages/lib/helpers/analytics/client/client-metrics';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) return handleUnauthorized();

  const body: AddClientRequestBody = await request.json();

  const { error } = AddClientRequestBodySchema.validate(body);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    const client = await db.client.create({
      data: {
        userId: currentUser.id,
        name: body.name,
        email: body.email || '',
        phone: body.phone || '',
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
