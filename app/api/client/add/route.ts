import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { ClientRequestBody } from './types';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: ClientRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

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

    return handleSuccess({
      content: client,
      message: 'Successfully Created Client'
    });
  } catch (err) {
    return handleError({ message: 'Failed to create client', err });
  }
}
