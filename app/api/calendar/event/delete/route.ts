import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { DeleteCalendarEventRequestBodySchema } from './types';
import { db } from '@/packages/lib/prisma/client';

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody = await request.json();

  if (!currentUser) {
    return handleUnauthorized();
  }

  const { error } = DeleteCalendarEventRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    await db.calendarEvent.delete({
      where: {
        id: requestBody.id
      }
    });

    return handleSuccess({ message: 'Successfully deleted event' });
  } catch (error: unknown) {
    console.error('Error deleting calendar event:', error);
    return handleError({ message: 'Error deleting calendar event' });
  }
}
