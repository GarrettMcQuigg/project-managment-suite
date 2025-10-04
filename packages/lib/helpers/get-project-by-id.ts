import { db } from '@packages/lib/prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { decrypt } from '@/packages/lib/utils/encryption';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { refreshSignedUrlForAttachment } from './supabase/refresh-signed-url';

interface WhereClause {
  id: string;
  deletedAt?: Date | null;
  userId?: string;
}

/**
 * INTERNAL: Fetches project with all metadata
 * Use getProjectWithMetadataById or getProjectForPortalAccess instead
 */
async function fetchProjectWithMetadata(id: string, userId?: string): Promise<ProjectWithMetadata | null> {
  try {
    const whereClause = {
      id,
      deletedAt: null,
      userId: userId
    } as WhereClause;

    // Filter by userId if provided
    if (userId) {
      whereClause.userId = userId;
    } else {
      whereClause.userId = undefined;
    }

    const project: ProjectWithMetadata = await db.project.findUniqueOrThrow({
      where: whereClause,
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

/**
 * Gets a project by ID for the CURRENT LOGGED-IN USER ONLY
 * This is the SECURE default - use this for all authenticated user operations
 * Portal visitors should use getProjectForPortalAccess instead
 */
export async function getProjectWithMetadataById(id: string): Promise<ProjectWithMetadata | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // SECURITY: Only return projects owned by the current user
  return fetchProjectWithMetadata(id, currentUser.id);
}

/**
 * Gets a project by ID for PORTAL ACCESS ONLY
 * WARNING: This bypasses user ownership checks!
 * Only use this for portal routes where access is controlled by portal session validation
 *
 * SECURITY REQUIREMENTS before calling this:
 * 1. Must have validated portal session for this specific project
 * 2. Must verify portal slug matches the project
 * 3. Must be in a portal-specific route handler
 */
export async function getProjectForPortalAccess(id: string): Promise<ProjectWithMetadata | null> {
  // No user filtering - portal visitors aren't logged-in users
  // Security is handled by portal session validation in the calling code
  return fetchProjectWithMetadata(id);
}
