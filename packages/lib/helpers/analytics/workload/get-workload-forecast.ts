import { db } from "@/packages/lib/prisma/client";


type WorkloadForecast = {
  upcoming: {
    date: Date;
    estimatedHours: number;
    projectId: string;
    projectName: string;
    clientName: string;
    deadline: boolean;
  }[];
  capacityUtilization: number; // Percentage of capacity utilized in forecast period
  overallocation: boolean; // Whether the user is overallocated
};

/**
 * Gets a forecast of upcoming workload based on project deadlines and current workload
 * @param userId - The ID of the user
 * @param daysAhead - Number of days to forecast ahead (default: 14)
 * @param dailyCapacity - User's daily work capacity in hours (default: 8)
 */
export async function GetWorkloadForecast(
  userId: string,
  daysAhead: number = 14,
  dailyCapacity: number = 8
): Promise<WorkloadForecast | null> {
  try {
    // Get active projects for the user
    const projects = await db.project.findMany({
      where: {
        userId: userId,
        deletedAt: null,
        status: {
          not: 'COMPLETED'
        },
        endDate: {
          gte: new Date()
        }
      },
      include: {
        client: {
          select: {
            name: true
          }
        }
      }
    });

    if (projects.length === 0) {
      return {
        upcoming: [],
        capacityUtilization: 0,
        overallocation: false
      };
    }

    const today = new Date();
    const forecastEndDate = new Date();
    forecastEndDate.setDate(today.getDate() + daysAhead);

    // Create a forecast of upcoming work
    const upcoming: {
      date: Date;
      estimatedHours: number;
      projectId: string;
      projectName: string;
      clientName: string;
      deadline: boolean;
    }[] = [];

    // Calculate total estimated hours in the forecast period
    let totalEstimatedHours = 0;

    // Process each project
    for (const project of projects) {
      // Check if project end date is within forecast period
      if (project.endDate <= forecastEndDate) {
        // Add project deadline as an event
        upcoming.push({
          date: project.endDate,
          estimatedHours: 0, // No hours allocated on deadline day
          projectId: project.id,
          projectName: project.name,
          clientName: project.client.name,
          deadline: true
        });

        // Calculate days until deadline
        const daysUntilDeadline = Math.max(1, Math.ceil(
          (project.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        ));

        // Estimate remaining work
        // This is a simplified model - in reality, you would need to track
        // actual project progress and remaining work
        const estimatedDailyHours = 2; // Placeholder - adjust based on project complexity
        totalEstimatedHours += estimatedDailyHours * daysUntilDeadline;

        // Distribute estimated hours across days until deadline
        for (let i = 0; i < daysUntilDeadline; i++) {
          const workDate = new Date();
          workDate.setDate(today.getDate() + i);
          
          // Skip weekends in a simple way
          const dayOfWeek = workDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            continue;
          }
          
          upcoming.push({
            date: workDate,
            estimatedHours: estimatedDailyHours,
            projectId: project.id,
            projectName: project.name,
            clientName: project.client.name,
            deadline: false
          });
        }
      }
    }

    // Sort by date
    upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate capacity utilization
    // Count working days in the forecast period (excluding weekends)
    let workingDays = 0;
    for (let i = 0; i <= daysAhead; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    const totalCapacity = workingDays * dailyCapacity;
    const capacityUtilization = totalCapacity > 0 
      ? (totalEstimatedHours / totalCapacity) * 100 
      : 0;

    return {
      upcoming,
      capacityUtilization: parseFloat(capacityUtilization.toFixed(2)),
      overallocation: capacityUtilization > 100
    };
  } catch (error: unknown) {
    console.error('Failed to get workload forecast:', error);
    return null;
  }
}
