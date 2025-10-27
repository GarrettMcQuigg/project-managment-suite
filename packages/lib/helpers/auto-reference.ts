import { db } from '@/packages/lib/prisma/client';

interface CreateCheckpointReferenceParams {
  projectId: string;
  checkpointId: string;
  checkpointName: string;
  sender: string;
}

interface CreateAttachmentReferenceParams {
  projectId: string;
  checkpointId: string;
  checkpointName: string;
  attachmentId: string;
  attachmentName: string;
  sender: string;
  markupId?: string;
}

/**
 * Creates an auto-reference message in project-level messages when a checkpoint message is created
 */
export async function createCheckpointReference({ projectId, checkpointId, checkpointName, sender }: CreateCheckpointReferenceParams) {
  try {
    // Create reference at project level (checkpointId = null) but store which checkpoint it references
    await db.projectMessage.create({
      data: {
        projectId,
        checkpointId: null, // Project-level message only - do NOT set checkpointId here
        sender,
        text: `💬 New discussion in ${checkpointName}`,
        isAutoReference: true,
        referencedCheckpointId: checkpointId // Store which checkpoint this references for navigation
      }
    });
  } catch (error) {
    console.error('Failed to create checkpoint reference:', error);
    // Don't throw - we don't want to fail the main operation if reference creation fails
  }
}

/**
 * Creates auto-reference messages when an attachment comment is created
 * - Creates reference in checkpoint messages
 * - Creates reference in project messages
 */
export async function createAttachmentReferences({
  projectId,
  checkpointId,
  checkpointName,
  attachmentId,
  attachmentName,
  sender,
  markupId
}: CreateAttachmentReferenceParams) {
  try {
    const referenceText = markupId ? `📌 New comment on markup in ${attachmentName}` : `💬 New comment on ${attachmentName}`;

    // Create reference in checkpoint messages
    await db.projectMessage.create({
      data: {
        projectId,
        checkpointId,
        sender,
        text: referenceText,
        isAutoReference: true,
        referencedAttachmentId: attachmentId,
        referencedMarkupId: markupId || null
      }
    });

    // Create reference in project-level messages
    await db.projectMessage.create({
      data: {
        projectId,
        checkpointId: null, // Project-level message
        sender,
        text: `${referenceText} in ${checkpointName}`,
        isAutoReference: true,
        referencedCheckpointId: checkpointId,
        referencedAttachmentId: attachmentId,
        referencedMarkupId: markupId || null
      }
    });
  } catch (error) {
    console.error('Failed to create attachment references:', error);
    // Don't throw - we don't want to fail the main operation if reference creation fails
  }
}
