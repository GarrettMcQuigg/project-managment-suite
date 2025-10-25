import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { AttachmentMarkup, AttachmentMarkupComment } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const context = await getSessionContext();

    if (context.type !== 'user' && context.type !== 'portal') {
      return handleUnauthorized();
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('attachmentId');

    if (!attachmentId) {
      return handleBadRequest({ message: 'Attachment ID is required' });
    }

    // Verify attachment exists
    const attachment = await db.projectMessageAttachment.findUnique({
      where: { id: attachmentId }
    });

    if (!attachment) {
      return handleBadRequest({ message: 'Attachment not found' });
    }

    // Get all markups for this attachment with their comments
    const markups: AttachmentMarkup[] = await db.attachmentMarkup.findMany({
      where: { attachmentId },
      include: {
        comments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Also get general file comments (not tied to specific markup)
    const generalComments: AttachmentMarkupComment[] = await db.attachmentMarkupComment.findMany({
      where: {
        attachmentId,
        markupId: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return handleSuccess({
      message: 'Markups retrieved successfully',
      content: {
        markups,
        generalComments
      }
    });
  } catch (error) {
    return handleError({ message: 'Failed to retrieve markups', err: error });
  }
}
