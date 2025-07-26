import { getCalendarEvents } from '@/packages/lib/helpers/get-calendar-events';
import { CalendarToggle } from './_src/components/calendar-toggle';

export default async function CalendarPage() {
  let events = await getCalendarEvents();

  if (!events) {
    return (events = []);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen-minus-header">
      <CalendarToggle events={events} />
    </div>
  );
}
