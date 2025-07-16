import { db } from "@/packages/lib/prisma/client";
import { CreateCommunicationAnalytics } from './create-communication-analytics';

/**
 * Tracks when a message is sent to a client
 * @param userId - The ID of the user sending the message
 * @param clientId - The ID of the client receiving the message
 * @param messageContent - Optional content of the message for sentiment analysis
 */
export async function TrackMessageSent(
  userId: string,
  clientId: string,
  messageContent?: string
): Promise<void> {
  try {
    // Get user analytics
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      },
      include: {
        communicationAnalytics: true
      }
    });

    if (!userAnalytics) {
      throw new Error('User analytics not found');
    }

    // Create communication analytics if they don't exist
    if (!userAnalytics.communicationAnalytics) {
      await CreateCommunicationAnalytics(userId);
      return TrackMessageSent(userId, clientId, messageContent);
    }

    // Update message count
    await db.communicationAnalytics.update({
      where: {
        id: userAnalytics.communicationAnalytics.id
      },
      data: {
        messagesSent: {
          increment: 1
        }
      }
    });

    // Check if client interaction exists
    const clientInteraction = await db.clientInteraction.findUnique({
      where: {
        communicationAnalyticsId_clientId: {
          communicationAnalyticsId: userAnalytics.communicationAnalytics.id,
          clientId: clientId
        }
      }
    });

    const now = new Date();

    if (clientInteraction) {
      // Update existing client interaction
      await db.clientInteraction.update({
        where: {
          id: clientInteraction.id
        },
        data: {
          lastInteraction: now,
          interactionCount: {
            increment: 1
          }
        }
      });
    } else {
      // Create new client interaction
      await db.clientInteraction.create({
        data: {
          communicationAnalyticsId: userAnalytics.communicationAnalytics.id,
          clientId: clientId,
          lastInteraction: now,
          interactionCount: 1
        }
      });
    }

    // TODO: Implement sentiment analysis if needed in the future
    // This would require an external API or library
  } catch (error: unknown) {
    console.error('Failed to track message sent:', error);
  }
}
