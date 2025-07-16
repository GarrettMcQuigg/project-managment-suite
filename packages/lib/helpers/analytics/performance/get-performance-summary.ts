import { db } from "@/packages/lib/prisma/client";

type PerformanceSummary = {
  profitability: {
    overall: number;
    byProject: {
      projectId: string;
      projectName: string;
      profitMargin: number;
      revenue: number;
      cost: number;
    }[];
  };
  clientMetrics: {
    acquisitionCost: number;
    lifetimeValue: number;
    roi: number; // Return on investment (LTV/CAC ratio)
  };
  projectMetrics: {
    completionRate: number;
    onTimeDeliveryRate: number;
    timeEfficiency: number; // Ratio of estimated to actual hours
  };
};

/**
 * Gets a summary of performance metrics for a user
 * @param userId - The ID of the user
 */
export async function GetPerformanceSummary(
  userId: string
): Promise<PerformanceSummary | null> {
  try {
    // Get user analytics
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      },
      include: {
        performanceMetrics: {
          include: {
            projectDetails: {
              include: {
                project: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!userAnalytics || !userAnalytics.performanceMetrics) {
      return null;
    }

    const metrics = userAnalytics.performanceMetrics;
    
    // Calculate Return on Investment
    const acquisitionCost = Number(metrics.clientAcquisitionCost);
    const lifetimeValue = Number(metrics.clientLifetimeValue);
    const roi = acquisitionCost > 0 
      ? lifetimeValue / acquisitionCost 
      : 0;
    
    // Calculate time efficiency across all projects
    let totalEstimatedHours = 0;
    let totalActualHours = 0;
    
    metrics.projectDetails.forEach(project => {
      totalEstimatedHours += project.estimatedHours;
      totalActualHours += project.actualHours;
    });
    
    const timeEfficiency = totalEstimatedHours > 0 
      ? (totalEstimatedHours / totalActualHours) * 100 
      : 0;
    
    // Create project profitability breakdown
    const projectProfitability = metrics.projectDetails.map(project => ({
      projectId: project.projectId,
      projectName: project.project.name,
      profitMargin: parseFloat(project.profitMargin.toFixed(2)),
      revenue: parseFloat(project.revenue.toFixed(2)),
      cost: parseFloat(project.actualCost.toFixed(2))
    })).sort((a, b) => b.profitMargin - a.profitMargin);
    
    return {
      profitability: {
        overall: parseFloat(metrics.projectProfitability.toFixed(2)),
        byProject: projectProfitability
      },
      clientMetrics: {
        acquisitionCost: parseFloat(metrics.clientAcquisitionCost.toFixed(2)),
        lifetimeValue: parseFloat(metrics.clientLifetimeValue.toFixed(2)),
        roi: parseFloat(roi.toFixed(2))
      },
      projectMetrics: {
        completionRate: parseFloat(metrics.projectCompletionRate.toFixed(2)),
        onTimeDeliveryRate: parseFloat(metrics.onTimeDeliveryRate.toFixed(2)),
        timeEfficiency: parseFloat(timeEfficiency.toFixed(2))
      }
    };
  } catch (error: unknown) {
    console.error('Failed to get performance summary:', error);
    return null;
  }
}
