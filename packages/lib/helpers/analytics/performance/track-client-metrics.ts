import { db } from "@/packages/lib/prisma/client";
import { CreatePerformanceMetrics } from './create-performance-metrics';

/**
 * Tracks client acquisition cost and updates client lifetime value
 * @param userId - The ID of the user
 * @param clientId - The ID of the client
 * @param acquisitionCost - The cost to acquire this client (marketing, time spent, etc.)
 */
export async function TrackClientAcquisitionCost(
  userId: string,
  clientId: string,
  acquisitionCost: number
): Promise<void> {
  try {
    // Get user analytics
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

    // Create performance metrics if they don't exist
    if (!userAnalytics.performanceMetrics) {
      await CreatePerformanceMetrics(userId);
      return TrackClientAcquisitionCost(userId, clientId, acquisitionCost);
    }

    // Store the acquisition cost somewhere
    // For now, we'll just update the overall average
    // In a real implementation, you might want to store this per client
    
    // Get all clients for this user
    const clientCount = await db.client.count({
      where: {
        userId: userId,
        isArchived: false
      }
    });

    // Calculate new average acquisition cost
    const currentCost = Number(userAnalytics.performanceMetrics.clientAcquisitionCost);
    const newAvgCost = ((currentCost * (clientCount - 1)) + acquisitionCost) / clientCount;

    // Update performance metrics
    await db.performanceMetrics.update({
      where: {
        id: userAnalytics.performanceMetrics.id
      },
      data: {
        clientAcquisitionCost: newAvgCost
      }
    });

    // Update client lifetime value
    await UpdateClientLifetimeValue(userId);
  } catch (error: unknown) {
    console.error('Failed to track client acquisition cost:', error);
  }
}

/**
 * Updates the client lifetime value metric
 * @param userId - The ID of the user
 */
export async function UpdateClientLifetimeValue(
  userId: string
): Promise<void> {
  try {
    // Get user analytics
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      },
      include: {
        performanceMetrics: true
      }
    });

    if (!userAnalytics || !userAnalytics.performanceMetrics) {
      return;
    }

    // Get all clients for this user
    const clients = await db.client.findMany({
      where: {
        userId: userId,
        isArchived: false
      },
      include: {
        projects: {
          include: {
            invoices: true
          }
        }
      }
    });

    if (clients.length === 0) {
      return;
    }

    // Calculate average revenue per client
    let totalRevenue = 0;
    
    for (const client of clients) {
      for (const project of client.projects) {
        for (const invoice of project.invoices) {
          // Assuming invoice has an amount field
          // This would need to be adjusted based on your actual schema
          totalRevenue += Number(invoice.amount || 0);
        }
      }
    }

    const avgLifetimeValue = totalRevenue / clients.length;

    // Update performance metrics
    await db.performanceMetrics.update({
      where: {
        id: userAnalytics.performanceMetrics.id
      },
      data: {
        clientLifetimeValue: avgLifetimeValue
      }
    });
  } catch (error: unknown) {
    console.error('Failed to update client lifetime value:', error);
  }
}
