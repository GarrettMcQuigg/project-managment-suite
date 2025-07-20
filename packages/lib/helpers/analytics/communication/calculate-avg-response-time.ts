import { db } from "@/packages/lib/prisma/client";

/**
 * Calculates and updates the average response time for a user's communication analytics
 * @param userId - The ID of the user to calculate average response time for
 */
export async function CalculateAverageResponseTime(userId: string): Promise<void> {
  try {
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      },
      include: {
        communicationAnalytics: true
      }
    });

    if (!userAnalytics?.communicationAnalytics) {
        // TODO : Add internal error logging (ThreatLevel)
      return
    }

    const communicationAnalytics = userAnalytics.communicationAnalytics;

    if (communicationAnalytics.responseCount > 0) {
      const avgResponseTime = Math.round(
        communicationAnalytics.totalResponseTimeMinutes / communicationAnalytics.responseCount
      );

      await db.communicationAnalytics.update({
        where: {
          id: communicationAnalytics.id
        },
        data: {
          avgResponseTime: avgResponseTime
        }
      });
    }
  } catch (error: unknown) {
    // TODO : Add internal error logging (ThreatLevel)
    console.error('Failed to calculate average response time:', error);
  }
}
