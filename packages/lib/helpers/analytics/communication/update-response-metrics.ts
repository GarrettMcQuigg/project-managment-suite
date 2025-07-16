import { db } from "@/packages/lib/prisma/client";

/**
 * Updates the response rate and average response time metrics
 * This should be called periodically to update the analytics
 * @param userId - The ID of the user
 */
export async function UpdateResponseMetrics(
  userId: string
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

    if (!userAnalytics || !userAnalytics.communicationAnalytics) {
      return;
    }

    const commAnalytics = userAnalytics.communicationAnalytics;
    
    // Calculate response rate
    // Response rate = messages sent / messages received (capped at 100%)
    let responseRate = 0;
    if (commAnalytics.messagesReceived > 0) {
      responseRate = Math.min(
        (commAnalytics.messagesSent / commAnalytics.messagesReceived) * 100,
        100
      );
    }

    // Update analytics with response rate
    await db.analytics.update({
      where: {
        id: userAnalytics.id
      },
      data: {
        responseRate: responseRate
      }
    });

    // Update communication analytics with the average response time
    // This would be calculated based on the actual message timestamps
    // For now, we'll use a placeholder implementation
    
    // TODO: Implement actual average response time calculation
    // when message model with timestamps is available
  } catch (error: unknown) {
    console.error('Failed to update response metrics:', error);
  }
}
