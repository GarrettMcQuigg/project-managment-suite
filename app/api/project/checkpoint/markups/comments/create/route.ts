import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/portal/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { createAttachmentReferences } from '@/packages/lib/helpers/auto-reference';
import { User } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const context = await getSessionContext();

    let currentUser: User | PortalVisitor | null = null;
    let userId: string | null = null;
    let name: string | null = null;

    if (context.type === 'user') {
      currentUser = context.user as User;
      userId = currentUser.id;
      name = `${currentUser.firstname} ${currentUser.lastname}`.trim();
    } else if (context.type === 'portal') {
      currentUser = context.visitor as PortalVisitor;
      name = currentUser.name;
    }

    if (!currentUser) {
      return handleUnauthorized();
    }

    const body = await request.json();
    const { markupId, attachmentId, text } = body;

    if (!text || !text.trim()) {
      return handleBadRequest({ message: 'Comment text is required' });
    }

    // Must provide either markupId (comment on specific markup) or attachmentId (general file comment)
    if (!markupId && !attachmentId) {
      return handleBadRequest({ message: 'Either markup ID or attachment ID is required' });
    }

    // If markupId is provided, verify it exists
    if (markupId) {
      const markup = await db.attachmentMarkup.findUnique({
        where: { id: markupId },
        include: {
          attachment: {
            include: {
              message: {
                include: {
                  checkpoint: true,
                  project: true
                }
              }
            }
          }
        }
      });

      if (!markup) {
        return handleBadRequest({ message: 'Markup not found' });
      }

      // Create comment tied to markup
      const comment = await db.attachmentMarkupComment.create({
        data: {
          markupId,
          attachmentId: markup.attachmentId,
          userId,
          name,
          text: text.trim()
        }
      });

      // Update attachment activity
      await db.projectMessageAttachment.update({
        where: { id: markup.attachmentId },
        data: {
          hasUnreadMarkups: true,
          lastMarkupAt: new Date()
        }
      });

      // Create auto-references
      if (markup.attachment.message.checkpoint) {
        await createAttachmentReferences({
          projectId: markup.attachment.message.projectId,
          checkpointId: markup.attachment.message.checkpointId!,
          checkpointName: markup.attachment.message.checkpoint.name,
          attachmentId: markup.attachmentId,
          attachmentName: markup.attachment.pathname.split('/').pop() || 'file',
          sender: name || 'Unknown',
          markupId
        });
      }

      return handleSuccess({
        message: 'Comment added successfully',
        content: comment
      });
    }

    // Otherwise, create general file comment
    const attachment = await db.projectMessageAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        message: {
          include: {
            checkpoint: true
          }
        }
      }
    });

    if (!attachment) {
      return handleBadRequest({ message: 'Attachment not found' });
    }

    const comment = await db.attachmentMarkupComment.create({
      data: {
        attachmentId,
        userId,
        name,
        text: text.trim()
      }
    });

    // Update attachment activity
    await db.projectMessageAttachment.update({
      where: { id: attachmentId },
      data: {
        hasUnreadMarkups: true,
        lastMarkupAt: new Date()
      }
    });

    // Create auto-references
    if (attachment.message.checkpoint) {
      await createAttachmentReferences({
        projectId: attachment.message.projectId,
        checkpointId: attachment.message.checkpointId!,
        checkpointName: attachment.message.checkpoint.name,
        attachmentId,
        attachmentName: attachment.pathname.split('/').pop() || 'file',
        sender: name || 'Unknown'
      });
    }

    return handleSuccess({
      message: 'Comment added successfully',
      content: comment
    });
  } catch (error) {
    return handleError({ message: 'Failed to add comment', err: error });
  }
}
