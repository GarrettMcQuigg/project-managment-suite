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
    const { markupId } = body;

    if (!markupId) {
      return handleBadRequest({ message: 'Markup ID is required' });
    }

    // Get existing markup
    const existing = await db.attachmentMarkup.findUnique({
      where: { id: markupId }
    });

    if (!existing) {
      return handleBadRequest({ message: 'Markup not found' });
    }

    // Authorization check: users can only delete their own markups
    if (context.type === 'user' && existing.userId !== userId) {
      return handleUnauthorized({ message: 'You can only delete your own markups' });
    }

    if (context.type === 'portal' && existing.visitorName !== visitorName) {
      return handleUnauthorized({ message: 'You can only delete your own markups' });
    }

    // Delete the markup (comments will cascade delete)
    await db.attachmentMarkup.delete({
      where: { id: markupId }
    });

    return handleSuccess({
      message: 'Markup deleted successfully'
    });
  } catch (error) {
    return handleError({ message: 'Failed to delete markup', err: error });
  }
}
