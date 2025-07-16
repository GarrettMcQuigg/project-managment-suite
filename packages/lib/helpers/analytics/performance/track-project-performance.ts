import { db } from '@/lib/db';
import { CreatePerformanceMetrics } from './create-performance-metrics';

/**
 * Tracks performance metrics for a specific project
 * @param userId - The ID of the user
 * @param projectId - The ID of the project
 * @param estimatedHours - Estimated hours for the project
 * @param actualHours - Actual hours spent on the project
 * @param estimatedCost - Estimated cost for the project
 * @param actualCost - Actual cost of the project
 * @param revenue - Revenue generated from the project
 */
export async function TrackProjectPerformance(
  userId: string,
  projectId: string,
  estimatedHours: number,
  actualHours: number,
  estimatedCost: number,
  actualCost: number,
  revenue: number
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
      return TrackProjectPerformance(
        userId, 
        projectId, 
        estimatedHours, 
        actualHours, 
        estimatedCost, 
        actualCost, 
        revenue
      );
    }

    // Calculate profit margin
    const profit = revenue - actualCost;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Check if project performance already exists
    const existingPerformance = await db.projectPerformance.findUnique({
      where: {
        performanceMetricsId_projectId: {
          performanceMetricsId: userAnalytics.performanceMetrics.id,
          projectId: projectId
        }
      }
    });

    if (existingPerformance) {
      // Update existing project performance
      await db.projectPerformance.update({
        where: {
          id: existingPerformance.id
        },
        data: {
          estimatedHours,
          actualHours,
          estimatedCost,
          actualCost,
          revenue,
          profitMargin
        }
      });
    } else {
      // Create new project performance
      await db.projectPerformance.create({
        data: {
          performanceMetricsId: userAnalytics.performanceMetrics.id,
          projectId,
          estimatedHours,
          actualHours,
          estimatedCost,
          actualCost,
          revenue,
          profitMargin
        }
      });
    }

    // Update overall performance metrics
    await UpdateOverallPerformanceMetrics(userId);
  } catch (error: unknown) {
    console.error('Failed to track project performance:', error);
  }
}

/**
 * Updates the overall performance metrics based on all project performances
 * @param userId - The ID of the user
 */
async function UpdateOverallPerformanceMetrics(userId: string): Promise<void> {
  try {
    // Get user analytics with performance metrics
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      },
      include: {
        performanceMetrics: {
          include: {
            projectDetails: true
          }
        }
      }
    });

    if (!userAnalytics || !userAnalytics.performanceMetrics) {
      return;
    }

    const performanceMetrics = userAnalytics.performanceMetrics;
    const projects = performanceMetrics.projectDetails;

    if (projects.length === 0) {
      return;
    }

    // Calculate average project profitability
    const totalProfit = projects.reduce((sum, project) => {
      return sum + (project.revenue - project.actualCost);
    }, 0);
    
    const totalRevenue = projects.reduce((sum, project) => sum + project.revenue, 0);
    const avgProfitability = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Calculate on-time delivery rate
    // This would require additional data about project deadlines and completion dates
    // For now, we'll use a placeholder implementation
    const onTimeDeliveryRate = 0; // Placeholder

    // Calculate project completion rate
    // This would require additional data about project status
    // For now, we'll use a placeholder implementation
    const projectCompletionRate = 0; // Placeholder

    // Update performance metrics
    await db.performanceMetrics.update({
      where: {
        id: performanceMetrics.id
      },
      data: {
        projectProfitability: avgProfitability,
        onTimeDeliveryRate,
        projectCompletionRate
      }
    });
  } catch (error: unknown) {
    console.error('Failed to update overall performance metrics:', error);
  }
}
