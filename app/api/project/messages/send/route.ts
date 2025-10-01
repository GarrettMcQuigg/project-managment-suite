import { handleBadRequest, handleError, handleNotFound, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { createAdminClient } from '@/packages/lib/utils/supabase/client';
import { PortalVisitor } from '@/packages/lib/helpers/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User } from '@prisma/client';
import { UpdateMessageMetrics } from '@/packages/lib/helpers/analytics/messages/message-metrics';
import { TrackMessageReceived, TrackMessageSent } from '@/packages/lib/helpers/analytics/communication';

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
          sender: portalVisitor.name,
          text: text || ''
        }
      });

      // Track both message metrics and communication analytics
      await Promise.all([
        // Response rate calculation
        UpdateMessageMetrics(projectWithDetails.userId),

        // Communication analytics tracking - client sending message to user
        TrackMessageReceived(
          projectWithDetails.userId,
          projectWithDetails.client.id,
          text || '',
          undefined // responseToMessageId is not tracked in this UI
        )
      ]);
    }

    if (!newMessage) {
      return handleBadRequest({ message: 'Failed to create message' });
    }

    if (attachmentFiles.length > 0) {
      const supabase = await createAdminClient();

      const attachmentPromises = attachmentFiles.map(async (file) => {
        try {
          const filePath = `project-messages/${projectId}/message-${newMessage.id}-${file.name}`;
          const fileBuffer = await file.arrayBuffer();

          const { error: storageError } = await supabase.storage.from('blob-storage').upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: false
          });

          if (storageError) {
            throw storageError;
          }

          // Generate a signed URL valid for 90 days
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('blob-storage').createSignedUrl(filePath, 7776000); // 90 days in seconds

          if (signedUrlError) {
            throw signedUrlError;
          }

          return db.projectMessageAttachment.create({
            data: {
              messageId: newMessage.id,
              blobUrl: signedUrlData.signedUrl,
              pathname: filePath,
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
