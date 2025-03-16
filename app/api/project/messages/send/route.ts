import { handleBadRequest, handleError, handleNotFound, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User } from '@prisma/client';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const context = await getSessionContext();

    let currentUser: User | PortalVisitor | null = null;
    if (context.type === 'user') {
      currentUser = context.user as User;
    } else if (context.type === 'portal') {
      currentUser = context.visitor as PortalVisitor;
    }

    if (!currentUser) {
      return handleUnauthorized();
    }

    const formData = await request.formData();
    const projectId = formData.get('projectId') as string;
    const text = formData.get('text') as string;

    if (!projectId) {
      return handleBadRequest({ message: 'Project ID is required' });
    }

    const attachmentFiles = formData.getAll('attachments') as File[];

    if (!text && attachmentFiles.length === 0) {
      return handleBadRequest({ message: 'Message text or attachments are required' });
    }

    const project = await db.project.findUnique({
      where: {
        id: projectId
      },
      include: {
        participants: true
      }
    });

    if (!project) {
      return handleBadRequest({ message: 'Project not found' });
    }

    let newMessage;

    if (context.type === 'user') {
      const userDetails = await db.user.findUnique({
        where: {
          id: (currentUser as User).id
        },
        select: {
          firstname: true,
          lastname: true,
          email: true
        }
      });

      if (!userDetails) {
        return handleNotFound({ message: 'User not found' });
      }

      newMessage = await db.projectMessage.create({
        data: {
          projectId: projectId,
          sender: `${userDetails.firstname} ${userDetails.lastname}`,
          text: text || ''
        }
      });
    } else if (context.type === 'portal') {
      const portalVisitor = currentUser as PortalVisitor;

      newMessage = await db.projectMessage.create({
        data: {
          projectId: projectId,
          sender: portalVisitor.name,
          text: text || ''
        }
      });
    }

    if (!newMessage) {
      return handleBadRequest({ message: 'Failed to create message' });
    }

    if (attachmentFiles.length > 0) {
      const attachmentPromises = attachmentFiles.map(async (file) => {
        try {
          const blobPath = `project-messages/${projectId}/message-${newMessage.id}-${file.name}`;
          const blob = await put(blobPath, file, { access: 'public' });

          return db.projectMessageAttachment.create({
            data: {
              messageId: newMessage.id,
              blobUrl: blob.url,
              pathname: blob.pathname,
              contentType: file.type
            }
          });
        } catch (error) {
          console.error('Error processing attachment:', error);
          return null;
        }
      });

      await Promise.all(attachmentPromises);
    }

    return handleSuccess({
      message: 'Message sent successfully'
    });
  } catch (error) {
    return handleError({ message: 'Failed to send message', err: error });
  }
}
