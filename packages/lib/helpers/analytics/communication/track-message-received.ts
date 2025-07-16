import { db } from "@/packages/lib/prisma/client";
import { CreateCommunicationAnalytics } from './create-communication-analytics';

/**
 * Tracks when a message is received from a client
 * @param userId - The ID of the user receiving the message
 * @param clientId - The ID of the client sending the message
 * @param messageContent - Optional content of the message for sentiment analysis
 * @param responseToMessageId - Optional ID of the message this is responding to (for response time tracking)
 */
export async function TrackMessageReceived(
  userId: string,
  clientId: string,
  messageContent?: string,
  responseToMessageId?: string
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
      return TrackMessageReceived(userId, clientId, messageContent, responseToMessageId);
    }

    // Update message count
    await db.communicationAnalytics.update({
      where: {
        id: userAnalytics.communicationAnalytics.id
      },
      data: {
        messagesReceived: {
          increment: 1
        }
      }
    });

    const now = new Date();

    // Check if client interaction exists
    const clientInteraction = await db.clientInteraction.findUnique({
      where: {
        communicationAnalyticsId_clientId: {
          communicationAnalyticsId: userAnalytics.communicationAnalytics.id,
          clientId: clientId
        }
      }
    });

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

    // If this is a response to a previous message, calculate response time
    if (responseToMessageId) {
      // This would require a message model with timestamps
      // For now, we'll implement a placeholder
      // In a real implementation, you would look up the original message timestamp
      // and calculate the difference
      
      // TODO: Implement response time tracking when message model is available
    }

    // TODO: Implement sentiment analysis if needed in the future
  } catch (error: unknown) {
    console.error('Failed to track message received:', error);
  }
}
