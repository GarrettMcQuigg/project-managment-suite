import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/portal/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const context = await getSessionContext();

    let currentUser: User | PortalVisitor | null = null;
    let userId: string | null = null;
    let visitorName: string | null = null;

    if (context.type === 'user') {
      currentUser = context.user as User;
      userId = currentUser.id;
    } else if (context.type === 'portal') {
      currentUser = context.visitor as PortalVisitor;
      visitorName = currentUser.name;
    }

    if (!currentUser) {
      return handleUnauthorized();
    }

    const body = await request.json();
    const { markupIds } = body;

    if (!markupIds || !Array.isArray(markupIds) || markupIds.length === 0) {
      return handleBadRequest({ message: 'Markup IDs array is required' });
    }

    // Get all existing markups
    const existingMarkups = await db.attachmentMarkup.findMany({
      where: { id: { in: markupIds } }
    });

    if (existingMarkups.length !== markupIds.length) {
      return handleBadRequest({ message: 'One or more markups not found' });
    }

    // Authorization check: users can only delete their own markups
    for (const markup of existingMarkups) {
      if (context.type === 'user' && markup.userId !== userId) {
        return handleUnauthorized({ message: 'You can only delete your own markups' });
      }
      if (context.type === 'portal' && markup.name !== visitorName) {
        return handleUnauthorized({ message: 'You can only delete your own markups' });
      }
    }

    // Delete all markups in a single transaction (comments will cascade delete)
    await db.attachmentMarkup.deleteMany({
      where: { id: { in: markupIds } }
    });

    return handleSuccess({
      message: 'Markups deleted successfully',
      content: { deletedCount: markupIds.length }
    });
  } catch (error) {
    return handleError({ message: 'Failed to delete markups', err: error });
  }
}
