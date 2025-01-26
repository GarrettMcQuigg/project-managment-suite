import { NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { DeleteClientRequestBodySchema } from './types';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = DeleteClientRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    await db.client.delete({ where: { id: requestBody.id } });

    return handleSuccess({ message: 'Successfully Deleted Client' });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to update client', err });
  }
}
