import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/portal/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User, MarkupType } from '@prisma/client';

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
    const { markups } = body;

    if (!markups || !Array.isArray(markups) || markups.length === 0) {
      return handleBadRequest({ message: 'Markups array is required' });
    }

    // Validate all markups
    for (const markup of markups) {
      if (!markup.attachmentId) {
        return handleBadRequest({ message: 'Attachment ID is required for all markups' });
      }
      if (!markup.type || !Object.values(MarkupType).includes(markup.type)) {
        return handleBadRequest({ message: 'Valid markup type is required for all markups' });
      }
      if (!markup.canvasData) {
        return handleBadRequest({ message: 'Canvas data is required for all markups' });
      }
    }

    // Get unique attachment IDs to verify they exist
    const attachmentIds = [...new Set(markups.map(m => m.attachmentId))];
    const attachments = await db.projectMessageAttachment.findMany({
      where: { id: { in: attachmentIds } }
    });

    if (attachments.length !== attachmentIds.length) {
      return handleBadRequest({ message: 'One or more attachments not found' });
    }

    // Create all markups in a single transaction
    const createdMarkups = await db.$transaction(
      markups.map((markup) =>
        db.attachmentMarkup.create({
          data: {
            attachmentId: markup.attachmentId,
            userId,
            visitorName,
            type: markup.type,
            canvasData: markup.canvasData,
            position: markup.position || {},
            color: markup.color,
            strokeWidth: markup.strokeWidth
          }
        })
      )
    );

    // Update all affected attachments
    await db.$transaction(
      attachmentIds.map((attachmentId) =>
        db.projectMessageAttachment.update({
          where: { id: attachmentId },
          data: {
            hasUnreadMarkups: true,
            lastMarkupAt: new Date()
          }
        })
      )
    );

    return handleSuccess({
      message: 'Markups created successfully',
      content: createdMarkups
    });
  } catch (error) {
    return handleError({ message: 'Failed to create markups', err: error });
  }
}
