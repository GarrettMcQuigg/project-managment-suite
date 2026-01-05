import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/portal/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User } from '@prisma/client';

export async function PATCH(request: Request) {
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
    const { markupId, canvasData, position, color, strokeWidth, visible } = body;

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

    // Authorization check: users can only update their own markups
    if (context.type === 'user' && existing.userId !== userId) {
      return handleUnauthorized({ message: 'You can only update your own markups' });
    }

    if (context.type === 'portal' && existing.name !== visitorName) {
      return handleUnauthorized({ message: 'You can only update your own markups' });
    }

    // Update the markup
    const updated = await db.attachmentMarkup.update({
      where: { id: markupId },
      data: {
        ...(canvasData && { canvasData }),
        ...(position && { position }),
        ...(color && { color }),
        ...(strokeWidth !== undefined && { strokeWidth }),
        ...(visible !== undefined && { visible })
      }
    });

    return handleSuccess({
      message: 'Markup updated successfully',
      content: updated
    });
  } catch (error) {
    return handleError({ message: 'Failed to update markup', err: error });
  }
}
