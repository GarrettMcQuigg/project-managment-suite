import { db } from '@/lib/db';

/**
 * Creates communication analytics for a user if they don't already exist
 * @param userId - The ID of the user
 */
export async function CreateCommunicationAnalytics(
  userId: string
): Promise<void> {
  try {
    // Check if user analytics exist
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

    // If communication analytics already exist, do nothing
    if (userAnalytics.communicationAnalytics) {
      return;
    }

    // Create communication analytics
    await db.communicationAnalytics.create({
      data: {
        analyticsId: userAnalytics.id,
        messagesSent: 0,
        messagesReceived: 0
      }
    });
  } catch (error: unknown) {
    console.error('Failed to create communication analytics:', error);
  }
}
