import { db } from '@/packages/lib/prisma/client';
import { GetTimeSummary } from './get-time-summary';

/**
 * Updates the workload distribution for a specific date
 * This function should be called periodically (e.g., daily) to update workload analytics
 * @param userId - The ID of the user
 * @param date - The date to update workload distribution for
 */
export async function UpdateWorkloadDistribution(
  userId: string,
  date: Date
): Promise<void> {
  try {
    // Set date to beginning of the day
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Set date range for the day
    const startDate = new Date(targetDate);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    // Get time summary for the day
    const timeSummary = await GetTimeSummary(userId, startDate, endDate);
    
    if (!timeSummary) {
      return;
    }
    
    // Get user analytics
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      }
    });

    if (!userAnalytics) {
      return;
    }
    
    // Check if workload distribution already exists for this date
    const existingWorkload = await db.workloadDistribution.findUnique({
      where: {
        analyticsId_date: {
          analyticsId: userAnalytics.id,
          date: targetDate
        }
      }
    });
    
    if (existingWorkload) {
      // Update existing workload distribution
      await db.workloadDistribution.update({
        where: {
          id: existingWorkload.id
        },
        data: {
          totalHours: timeSummary.totalHours,
          billableHours: timeSummary.billableHours,
          nonBillableHours: timeSummary.nonBillableHours
        }
      });
      
      // Delete existing project allocations
      await db.projectAllocation.deleteMany({
        where: {
          workloadDistributionId: existingWorkload.id
        }
      });
      
      // Create new project allocations
      for (const project of timeSummary.projectBreakdown) {
        await db.projectAllocation.create({
          data: {
            workloadDistributionId: existingWorkload.id,
            projectId: project.projectId,
            hoursAllocated: project.hours,
            percentageOfTotal: project.percentage
          }
        });
      }
    } else {
      // Create new workload distribution
      const newWorkload = await db.workloadDistribution.create({
        data: {
          analyticsId: userAnalytics.id,
          date: targetDate,
          totalHours: timeSummary.totalHours,
          billableHours: timeSummary.billableHours,
          nonBillableHours: timeSummary.nonBillableHours
        }
      });
      
      // Create project allocations
      for (const project of timeSummary.projectBreakdown) {
        await db.projectAllocation.create({
          data: {
            workloadDistributionId: newWorkload.id,
            projectId: project.projectId,
            hoursAllocated: project.hours,
            percentageOfTotal: project.percentage
          }
        });
      }
    }
  } catch (error: unknown) {
    console.error('Failed to update workload distribution:', error);
  }
}
