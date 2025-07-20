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

    if (!userAnalytics.communicationAnalytics) {
      await CreateCommunicationAnalytics(userId);
      return TrackMessageSent(userId, clientId, messageContent);
    }

    const currentAnalytics = await db.communicationAnalytics.findUnique({
      where: {
        id: userAnalytics.communicationAnalytics.id
      }
    });

    if (!currentAnalytics) {
      throw new Error('Communication analytics not found');
    }

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
      await db.clientInteraction.create({
        data: {
          communicationAnalyticsId: userAnalytics.communicationAnalytics.id,
          clientId: clientId,
          lastInteraction: now,
          interactionCount: 1
        }
      });
    }

  } catch (error: unknown) {
    console.error('Failed to track message sent:', error);
  }
}
