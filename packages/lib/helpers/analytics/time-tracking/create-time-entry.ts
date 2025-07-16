import { db } from '@/lib/db';

/**
 * Creates a new time tracking entry for a project
 * @param userId - The ID of the user
 * @param projectId - The ID of the project
 * @param startTime - When the time tracking started
 * @param endTime - When the time tracking ended (optional)
 * @param description - Description of the work done
 * @param billable - Whether this time is billable
 */
export async function CreateTimeEntry(
  userId: string,
  projectId: string,
  startTime: Date,
  endTime?: Date,
  description?: string,
  billable: boolean = true
): Promise<void> {
  try {
    // Get user analytics
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      }
    });

    if (!userAnalytics) {
      throw new Error('User analytics not found');
    }

    // Calculate duration if both start and end times are provided
    let duration: number | undefined;
    if (endTime) {
      duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // Duration in minutes
    }

    // Create time tracking entry
    await db.timeTracking.create({
      data: {
        analyticsId: userAnalytics.id,
        projectId: projectId,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        description: description,
        billable: billable
      }
    });
  } catch (error: unknown) {
    console.error('Failed to create time tracking entry:', error);
  }
}
