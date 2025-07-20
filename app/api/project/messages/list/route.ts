import { handleBadRequest, handleError, handleNotFound, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User } from '@prisma/client';
import { CalculateAverageResponseTime } from '@/packages/lib/helpers/analytics/communication';

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
    
    // If user is viewing messages, update response time analytics
    if (context.type === 'user') {
      try {
        // Update response time calculations when a user views messages
        // This helps keep the average response time metric current
        await CalculateAverageResponseTime(currentUser.id);
      } catch (error) {
        // Don't fail the request if analytics update fails
        console.error('Error updating response analytics:', error);
      }
    }

    return handleSuccess({ content: messages });
  } catch (error) {
    console.error('Error fetching project messages:', error);
    return handleError();
  }
}
