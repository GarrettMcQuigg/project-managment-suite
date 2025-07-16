import { db } from "@/packages/lib/prisma/client";

type WorkloadData = {
  date: Date;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  utilization: number; // Percentage of billable hours
  projects: {
    projectId: string;
    projectName: string;
    hoursAllocated: number;
    percentageOfTotal: number;
  }[];
};

/**
 * Gets workload distribution data for a specific date range
 * @param userId - The ID of the user
 * @param startDate - Start of the date range
 * @param endDate - End of the date range
 */
export async function GetWorkloadDistribution(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WorkloadData[]> {
  try {
    // Get user analytics
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      }
    });

    if (!userAnalytics) {
      return [];
    }

    // Get workload distribution for the date range
    const workloadData = await db.workloadDistribution.findMany({
      where: {
        analyticsId: userAnalytics.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        projectAllocation: {
          include: {
            project: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Format the data for the frontend
    return workloadData.map(workload => {
      // Calculate utilization rate (billable hours / total hours)
      const totalHoursNum = Number(workload.totalHours);
      const utilization = totalHoursNum > 0 
        ? (Number(workload.billableHours) / totalHoursNum) * 100 
        : 0;

      return {
        date: workload.date,
        totalHours: parseFloat(workload.totalHours.toString()),
        billableHours: parseFloat(workload.billableHours.toString()),
        nonBillableHours: parseFloat(workload.nonBillableHours.toString()),
        utilization: parseFloat(utilization.toFixed(2)),
        projects: workload.projectAllocation.map(allocation => ({
          projectId: allocation.projectId,
          projectName: allocation.project.name,
          hoursAllocated: parseFloat(allocation.hoursAllocated.toString()),
          percentageOfTotal: parseFloat(allocation.percentageOfTotal.toString())
        }))
      };
    });
  } catch (error: unknown) {
    console.error('Failed to get workload distribution:', error);
    return [];
  }
}
