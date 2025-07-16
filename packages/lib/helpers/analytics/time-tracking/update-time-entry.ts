import { db } from '@/lib/db';

/**
 * Updates an existing time tracking entry
 * @param timeEntryId - The ID of the time entry to update
 * @param startTime - Updated start time
 * @param endTime - Updated end time
 * @param description - Updated description
 * @param billable - Updated billable status
 */
export async function UpdateTimeEntry(
  timeEntryId: string,
  startTime?: Date,
  endTime?: Date,
  description?: string,
  billable?: boolean
): Promise<void> {
  try {
    // Get current time entry
    const currentEntry = await db.timeTracking.findUnique({
      where: {
        id: timeEntryId
      }
    });

    if (!currentEntry) {
      throw new Error('Time entry not found');
    }

    // Calculate duration if both start and end times are provided
    let duration: number | undefined;
    if (startTime && endTime) {
      duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // Duration in minutes
    } else if (startTime && currentEntry.endTime) {
      duration = Math.round((currentEntry.endTime.getTime() - startTime.getTime()) / 60000);
    } else if (endTime && currentEntry.startTime) {
      duration = Math.round((endTime.getTime() - currentEntry.startTime.getTime()) / 60000);
    }

    // Update time entry
    await db.timeTracking.update({
      where: {
        id: timeEntryId
      },
      data: {
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        duration: duration,
        description: description || undefined,
        billable: billable !== undefined ? billable : undefined
      }
    });
  } catch (error: unknown) {
    console.error('Failed to update time tracking entry:', error);
  }
}
