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
    const { attachmentId, type, canvasData, position, color, strokeWidth } = body;

    if (!attachmentId) {
      return handleBadRequest({ message: 'Attachment ID is required' });
    }

    if (!type || !Object.values(MarkupType).includes(type)) {
      return handleBadRequest({ message: 'Valid markup type is required' });
    }

    if (!canvasData) {
      return handleBadRequest({ message: 'Canvas data is required' });
    }

    // Verify attachment exists
    const attachment = await db.projectMessageAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        message: {
          include: {
            project: true
          }
        }
      }
    });

    if (!attachment) {
      return handleBadRequest({ message: 'Attachment not found' });
    }

    // Create the markup
    const markup = await db.attachmentMarkup.create({
      data: {
        attachmentId,
        userId,
        name,
        type,
        canvasData,
        position: position || {},
        color,
        strokeWidth
      }
    });

    // Update attachment with markup activity
    await db.projectMessageAttachment.update({
      where: { id: attachmentId },
      data: {
        hasUnreadMarkups: true,
        lastMarkupAt: new Date()
      }
    });

    return handleSuccess({
      message: 'Markup created successfully',
      content: markup
    });
  } catch (error) {
    return handleError({ message: 'Failed to create markup', err: error });
  }
}
