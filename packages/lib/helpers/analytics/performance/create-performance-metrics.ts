import { db } from '@/lib/db';

/**
 * Creates performance metrics for a user if they don't already exist
 * @param userId - The ID of the user
 */
export async function CreatePerformanceMetrics(
  userId: string
): Promise<void> {
  try {
    // Check if user analytics exist
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      },
      include: {
        performanceMetrics: true
      }
    });

    if (!userAnalytics) {
      throw new Error('User analytics not found');
    }

    // If performance metrics already exist, do nothing
    if (userAnalytics.performanceMetrics) {
      return;
    }

    // Create performance metrics
    await db.performanceMetrics.create({
      data: {
        analyticsId: userAnalytics.id,
        projectProfitability: 0,
        clientAcquisitionCost: 0,
        clientLifetimeValue: 0,
        projectCompletionRate: 0,
        onTimeDeliveryRate: 0
      }
    });
  } catch (error: unknown) {
    console.error('Failed to create performance metrics:', error);
  }
}
