import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return handleUnauthorized();

  const { id, projectData, client } = await request.json();
  if (!id || !projectData || !client) {
    return handleBadRequest({ message: 'Missing required fields' });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const clientRecord = client.id
        ? await tx.client.update({
            where: { id: client.id },
            data: {
              name: client.name,
              email: client.email,
              phone: client.phone
            }
          })
        : await tx.client.create({
            data: {
              userId: currentUser.id,
              name: client.name,
              email: client.email,
              phone: client.phone
            }
          });

      const updatedProject = await tx.project.update({
        where: { id },
        data: {
          ...projectData,
          clientId: clientRecord.id
        }
      });

      return { updatedProject, clientRecord };
    });

    return handleSuccess({
      message: 'Successfully updated project and client',
      content: result.updatedProject
    });
  } catch (err) {
    return handleError({ message: 'Failed to update project', err });
  }
}
