import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  try {
    const events = await db.calendarEvent.findMany({
      where: {
        userId: currentUser.id,
        deletedAt: null
      }
    });

    return handleSuccess({ content: events });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to fetch events', err });
  }
}
