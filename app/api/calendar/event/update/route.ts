import { UpdateCalendarEventRequestBody, UpdateCalendarEventRequestBodySchema } from './types';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { db } from '@/packages/lib/prisma/client';
import { Reminder } from '../add/types';

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: UpdateCalendarEventRequestBody = await request.json();

  if (!currentUser) {
    return handleUnauthorized();
  }

  const { error } = UpdateCalendarEventRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    const transformedReminders = requestBody.reminders.map((reminder: Reminder) => ({
      reminderTime: new Date(reminder.reminderTime),
      emailEnabled: reminder.emailEnabled,
      phoneEnabled: reminder.phoneEnabled,
      notificationEnabled: reminder.notificationEnabled,
      sent: false
    }));

    await db.calendarEvent.update({
      where: {
        id: requestBody.id
      },
      data: {
        title: requestBody.title,
        description: requestBody.description,
        startDate: new Date(requestBody.startDate),
        endDate: requestBody.endDate ? new Date(requestBody.endDate) : null,
        isAllDay: requestBody.isAllDay,
        type: requestBody.type,
        status: requestBody.status,
        color: requestBody.color,
        projectId: requestBody.projectId,
        checkpointId: requestBody.checkpointId,
        invoiceId: requestBody.invoiceId,
        clientId: requestBody.clientId,
        userId: currentUser.id,
        reminders: {
          create: transformedReminders
        }
      }
    });

    return handleSuccess({ message: 'Successfully created event' });
  } catch (error: unknown) {
    console.error('Error creating calendar event:', error);
    return handleError({ message: 'Error creating calendar event' });
  }
}
