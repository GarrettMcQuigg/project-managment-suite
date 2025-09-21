import { handleBadRequest, handleError, handleNotFound, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { put } from '@vercel/blob';
import { UpdateMessageMetrics } from '@/packages/lib/helpers/analytics/messages/message-metrics';
import { TrackMessageSent, TrackMessageReceived } from '@/packages/lib/helpers/analytics/communication';
import { User } from '@prisma/client';

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
    const checkpointId = formData.get('checkpointId') as string;
    const text = formData.get('text') as string;

    if (!projectId) {
      return handleBadRequest({ message: 'Project ID is required' });
    }

    if (!checkpointId) {
      return handleBadRequest({ message: 'Checkpoint ID is required' });
    }

    const attachmentFiles = formData.getAll('attachments') as File[];

    if (!text && attachmentFiles.length === 0) {
      return handleBadRequest({ message: 'Message text or attachments are required' });
    }

    // Verify project exists and get details
    const project = await db.project.findUnique({
      where: {
        id: projectId
      },
      include: {
        participants: true,
        checkpoints: {
          where: {
            id: checkpointId
          }
        }
      }
    });

    if (!project) {
      return handleBadRequest({ message: 'Project not found' });
    }

    // Verify checkpoint exists and belongs to this project
    if (project.checkpoints.length === 0) {
      return handleBadRequest({ message: 'Checkpoint not found or does not belong to this project' });
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

      // Get client associated with this project
      const projectWithClient = await db.project.findUnique({
        where: { id: projectId },
        include: { client: true }
      });

      if (!projectWithClient?.client) {
        return handleNotFound({ message: 'Client not found for this project' });
      }

      newMessage = await db.projectMessage.create({
        data: {
          projectId: projectId,
          checkpointId: checkpointId,
          sender: `${userDetails.firstname} ${userDetails.lastname}`,
          text: text || ''
        }
      });

      // Track both message metrics and communication analytics
      await Promise.all([
        // Response rate calculation
        UpdateMessageMetrics(currentUser.id),

        // Communication analytics tracking
        TrackMessageSent(currentUser.id, projectWithClient.client.id, text || '')
      ]);
    } else if (context.type === 'portal') {
      const portalVisitor = currentUser as PortalVisitor;

      // Get the project owner and client info
      const projectWithDetails = await db.project.findUnique({
        where: { id: projectId },
        include: {
          client: true,
          user: true
        }
      });

      if (!projectWithDetails?.user || !projectWithDetails?.client) {
        return handleNotFound({ message: 'Project details not found' });
      }

      newMessage = await db.projectMessage.create({
        data: {
          projectId: projectId,
          checkpointId: checkpointId,
          sender: portalVisitor.name,
          text: text || ''
        }
      });

      await Promise.all([UpdateMessageMetrics(projectWithDetails.userId), TrackMessageReceived(projectWithDetails.userId, projectWithDetails.client.id, text || '')]);
    }

    if (!newMessage) {
      return handleBadRequest({ message: 'Failed to create checkpoint message' });
    }

    let attachments: { id: string; fileName: string; fileUrl: string; fileType: string }[] = [];

    if (attachmentFiles.length > 0) {
      const attachmentPromises = attachmentFiles.map(async (file) => {
        try {
          const blobPath = `project-checkpoint-messages/${projectId}/checkpoint-${checkpointId}/message-${newMessage.id}-${file.name}`;
          const blob = await put(blobPath, file, { access: 'public' });

          const attachment = await db.projectMessageAttachment.create({
            data: {
              messageId: newMessage.id,
              blobUrl: blob.url,
              pathname: blob.pathname,
              contentType: file.type
            }
          });

          return {
            id: attachment.id,
            fileName: file.name,
            fileUrl: blob.url,
            fileType: file.type
          };
        } catch (error) {
          console.error('Error processing attachment:', error);
          return null;
        }
      });

      const attachmentResults = await Promise.all(attachmentPromises);
      attachments = attachmentResults.filter((attachment) => attachment !== null);
    }

    return handleSuccess({
      message: 'Checkpoint message sent successfully',
      content: {
        id: newMessage.id,
        attachments: attachments
      }
    });
  } catch (error) {
    return handleError({ message: 'Failed to send checkpoint message', err: error });
  }
}
