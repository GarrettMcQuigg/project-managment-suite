import { db } from '@/lib/db';

/**
 * Gets time tracking entries for a user, optionally filtered by project and date range
 * @param userId - The ID of the user
 * @param projectId - Optional project ID to filter by
 * @param startDate - Optional start date to filter by
 * @param endDate - Optional end date to filter by
 * @param billableOnly - Optional filter for billable entries only
 */
export async function GetTimeEntries(
  userId: string,
  projectId?: string,
  startDate?: Date,
  endDate?: Date,
  billableOnly?: boolean
) {
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

    // Build filter conditions
    const whereConditions: any = {
      analyticsId: userAnalytics.id
    };

    if (projectId) {
      whereConditions.projectId = projectId;
    }

    if (startDate) {
      whereConditions.startTime = {
        ...whereConditions.startTime,
        gte: startDate
      };
    }

    if (endDate) {
      whereConditions.startTime = {
        ...whereConditions.startTime,
        lte: endDate
      };
    }

    if (billableOnly) {
      whereConditions.billable = true;
    }

    // Get time entries
    const timeEntries = await db.timeTracking.findMany({
      where: whereConditions,
      include: {
        project: {
          select: {
            name: true,
            client: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    return timeEntries;
  } catch (error: unknown) {
    console.error('Failed to get time tracking entries:', error);
    return [];
  }
}
