import { db } from '@/packages/lib/prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { DeleteProjectRequestBody, DeleteProjectRequestBodySchema } from './types';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: DeleteProjectRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = DeleteProjectRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    await db.project.delete({ where: { id: requestBody.id } });

    return handleSuccess({ message: 'Successfully Deleted Project' });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to update project', err });
  }
}
