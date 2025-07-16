import { db } from '@/packages/lib/prisma/client';
import { Prisma } from '@prisma/client';

type TimeSummary = {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  projectBreakdown: {
    projectId: string;
    projectName: string;
    clientName: string;
    hours: number;
    percentage: number;
  }[];
};

/**
 * Gets a summary of time tracking for a user within a specified date range
 * @param userId - The ID of the user
 * @param startDate - Start date for the summary period
 * @param endDate - End date for the summary period
 */
export async function GetTimeSummary(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeSummary | null> {
  try {
    // Get user analytics
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      }
    });

    if (!userAnalytics) {
      return null;
    }

    // Get all time entries within the date range
    const timeEntries = await db.timeTracking.findMany({
      where: {
        analyticsId: userAnalytics.id,
        startTime: {
          gte: startDate,
          lte: endDate
        },
        duration: {
          not: null
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate total hours
    let totalMinutes = 0;
    let billableMinutes = 0;
    let nonBillableMinutes = 0;

    // Track time by project
    const projectMinutes: Record<string, {
      minutes: number,
      name: string,
      clientName: string
    }> = {};

    // Process each time entry
    timeEntries.forEach(entry => {
      if (entry.duration) {
        totalMinutes += entry.duration;
        
        if (entry.billable) {
          billableMinutes += entry.duration;
        } else {
          nonBillableMinutes += entry.duration;
        }

        // Add to project breakdown
        if (!projectMinutes[entry.projectId]) {
          projectMinutes[entry.projectId] = {
            minutes: 0,
            name: entry.project.name,
            clientName: entry.project.client.name
          };
        }
        projectMinutes[entry.projectId].minutes += entry.duration;
      }
    });

    // Convert minutes to hours
    const totalHours = parseFloat((totalMinutes / 60).toFixed(2));
    const billableHours = parseFloat((billableMinutes / 60).toFixed(2));
    const nonBillableHours = parseFloat((nonBillableMinutes / 60).toFixed(2));

    // Create project breakdown
    const projectBreakdown = Object.entries(projectMinutes).map(([projectId, data]) => {
      const hours = parseFloat((data.minutes / 60).toFixed(2));
      const percentage = totalHours > 0 
        ? parseFloat(((hours / totalHours) * 100).toFixed(1)) 
        : 0;
      
      return {
        projectId,
        projectName: data.name,
        clientName: data.clientName,
        hours,
        percentage
      };
    }).sort((a, b) => b.hours - a.hours);

    return {
      totalHours,
      billableHours,
      nonBillableHours,
      projectBreakdown
    };
  } catch (error: unknown) {
    console.error('Failed to get time tracking summary:', error);
    return null;
  }
}
