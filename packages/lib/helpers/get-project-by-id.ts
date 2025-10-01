import { db } from '@packages/lib/prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { decrypt } from '@/packages/lib/utils/encryption';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { refreshSignedUrlForAttachment } from './supabase/refresh-signed-url';

export async function getProjectWithMetadataById(id: string): Promise<ProjectWithMetadata | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  try {
    const project: ProjectWithMetadata = await db.project.findUniqueOrThrow({
      where: {
        id,
        userId: currentUser.id,
        deletedAt: null
      },
      include: {
        client: true,
        checkpoints: true,
        invoices: true,
        user: true,
        attachments: true,
        messages: {
          include: {
            attachments: true
          }
        },
        portalViews: true,
        calendarEvent: true
      }
    });

    if (project) {
      project.portalPassEncryption = decrypt(project.portalPassEncryption);
    }

    // TODO : Move this to a cron job
    if (project.messages) {
      const eightyThreeDaysAgo = new Date(Date.now() - 83 * 24 * 60 * 60 * 1000);

      for (const message of project.messages) {
        if (message.attachments) {
          for (const attachment of message.attachments) {
            if (attachment.createdAt < eightyThreeDaysAgo) {
              attachment.blobUrl = await refreshSignedUrlForAttachment(attachment);
            }
          }
        }
      }
    }

    return project;
  } catch (err: unknown) {
    return null;
  }
}
