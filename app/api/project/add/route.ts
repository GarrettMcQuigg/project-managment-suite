import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { ProjectCreateRequestBody } from './types';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  const { client, project }: ProjectCreateRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  try {
    const result = await db.$transaction(async (tx) => {
      const clientRecord = client.id
        ? await tx.client.findUnique({ where: { id: client.id } })
        : await tx.client.create({
            data: {
              userId: currentUser.id,
              name: client.name!,
              email: client.email!,
              phone: client.phone!
            }
          });

      if (!clientRecord) {
        throw new Error('Client not found');
      }

      const newProject = await tx.project.create({
        data: {
          ...project,
          userId: currentUser.id,
          clientId: clientRecord.id
        }
      });

      return { newProject, isNewClient: !client.id };
    });

    return handleSuccess({
      message: result.isNewClient ? 'Successfully Created Project and Client' : 'Successfully Created Project',
      content: result.newProject
    });
  } catch (err) {
    return handleError({ message: 'Failed to create project', err });
  }
}
