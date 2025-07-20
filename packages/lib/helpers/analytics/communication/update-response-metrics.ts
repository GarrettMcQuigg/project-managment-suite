import { db } from "@/packages/lib/prisma/client";
import { CalculateAverageResponseTime } from "./calculate-avg-response-time";

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

    // Calculate and update the average response time
    await CalculateAverageResponseTime(userId);
    
    // Store the current avgResponseTime as previousAvgResponseTime when updating
    // This will help track changes over time for the dashboard
    const updatedAnalytics = await db.analytics.findUnique({
      where: { userId },
      include: { communicationAnalytics: true }
    });
    
    // If we have a new average response time calculated, store the current one as previous
    if (updatedAnalytics?.communicationAnalytics?.avgResponseTime) {
      await db.communicationAnalytics.update({
        where: { id: updatedAnalytics.communicationAnalytics.id },
        data: {
          // Store the previous response time for historical tracking
          previousAvgResponseTime: updatedAnalytics.communicationAnalytics.avgResponseTime
        }
      }).catch(error => {
        console.error('Failed to update previous response time:', error);
      });
    }
  } catch (error: unknown) {
    console.error('Failed to update response metrics:', error);
  }
}
