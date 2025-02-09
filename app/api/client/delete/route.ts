import { db } from '@/packages/lib/prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { DeleteClientRequestBody, DeleteClientRequestBodySchema } from './types';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: DeleteClientRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = DeleteClientRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    await db.$transaction(async (tx) => {
      const client = await tx.client.findUnique({
        where: { id: requestBody.id },
        include: { projects: true }
      });

      if (!client) {
        throw new Error('Client not found');
      }

      if (client.projects.length > 0) {
        let systemClient = await tx.client.findFirst({
          where: {
            userId: currentUser.id,
            email: 'system@deleted.client'
          }
        });

        if (!systemClient) {
          systemClient = await tx.client.create({
            data: {
              userId: currentUser.id,
              name: 'Deleted Client',
              email: 'system@deleted.client',
              phone: 'N/A'
            }
          });
        }

        await tx.project.updateMany({
          where: { clientId: client.id },
          data: { clientId: systemClient.id }
        });
      }

      await tx.client.delete({
        where: { id: requestBody.id }
      });
    });

    return handleSuccess({ message: 'Successfully Deleted Client' });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to delete client', err });
  }
}
