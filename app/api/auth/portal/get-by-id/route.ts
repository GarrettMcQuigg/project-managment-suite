import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { NextRequest } from 'next/server';
import { validateProjectAccess } from '@/packages/lib/helpers/portal/project-portals';
import { decrypt } from '@/packages/lib/utils/encryption';

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  try {
    const project = await db.project.findUnique({
      where: {
        id: id?.toString(),
        deletedAt: null
      },
      include: {
        client: true,
        checkpoints: true,
        invoices: true,
        messages: {
          include: {
            attachments: true
          }
        }
      }
    });

    if (!project) {
      return handleError({ message: 'Project not found' });
    } else {
      project.portalPassEncryption = decrypt(project.portalPassEncryption);
    }

    const hasAccess = validateProjectAccess(project.id, project.portalSlug, currentUser?.id, project.userId, request.cookies);

    if (!hasAccess) {
      return handleError({ message: 'Access denied' });
    }

    const portalProjectData = {
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      checkpoints: project.checkpoints,
      client: project.client,
      invoices: project.invoices,
      portalPassEncryption: project.portalPassEncryption,
      checkpointMessages: project.messages.filter((message) => message.checkpointId !== null)
    };

    return handleSuccess({ content: portalProjectData });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to fetch project', err });
  }
}
