import { getCalendarEvents } from '@/packages/lib/helpers/get-calendar-events';
import CalendarView from './_src/components/calendar-view';
import EventList from './_src/components/event-list';

export default async function CalendarPage() {
  let events = await getCalendarEvents();

  if (!events) {
    return (events = []);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CalendarView events={events} />
        </div>
        <div>
          <EventList events={events} />
        </div>
      </div>
    </div>
  );
}
