import { handleBadRequest, handleError, handleNotFound, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const context = await getSessionContext();

    let currentUser: User | PortalVisitor | null = null;
    // TODO : make context type a constant
    if (context.type === 'user') {
      currentUser = context.user as User;
    } else if (context.type === 'portal') {
      currentUser = context.visitor as PortalVisitor;
    }

    if (!currentUser) {
      return handleUnauthorized();
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return handleBadRequest();
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      return handleNotFound();
    }

    const messages = await db.projectMessage.findMany({
      where: {
        projectId: projectId
      },
      include: {
        attachments: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return handleSuccess({ content: messages });
  } catch (error) {
    console.error('Error fetching project messages:', error);
    return handleError();
  }
}
