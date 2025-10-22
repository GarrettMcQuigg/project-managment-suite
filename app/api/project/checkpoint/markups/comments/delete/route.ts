import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/portal/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User } from '@prisma/client';

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return handleBadRequest({ message: 'Comment ID is required' });
    }

    // Get existing comment
    const existing = await db.attachmentMarkupComment.findUnique({
      where: { id: commentId }
    });

    if (!existing) {
      return handleBadRequest({ message: 'Comment not found' });
    }

    // Authorization check: users can only delete their own comments
    if (context.type === 'user' && existing.userId !== userId) {
      return handleUnauthorized({ message: 'You can only delete your own comments' });
    }

    if (context.type === 'portal' && existing.visitorName !== visitorName) {
      return handleUnauthorized({ message: 'You can only delete your own comments' });
    }

    // Delete the comment
    await db.attachmentMarkupComment.delete({
      where: { id: commentId }
    });

    return handleSuccess({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    return handleError({ message: 'Failed to delete comment', err: error });
  }
}
