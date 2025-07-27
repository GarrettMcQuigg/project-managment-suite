import { db } from '../prisma/client';
import { getCurrentUser } from './get-current-user';

export async function getCalendarEvents() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  try {
    const events = await db.calendarEvent.findMany({
      include: {
        client: true,
        project: true,
        user: true,
        checkpoint: true,
        invoice: true,
        reminders: true
      },
      orderBy: {
        startDate: 'desc'
      },
      where: {
        userId: currentUser.id
      }
    });

    console.log('Calendar events:', events);
    return events;
  } catch (error: unknown) {
    console.error('Failed to fetch events:', error);
    return null;
  }
}
