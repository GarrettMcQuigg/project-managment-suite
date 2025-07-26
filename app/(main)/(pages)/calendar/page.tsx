import { getCalendarEvents } from '@/packages/lib/helpers/get-calendar-events';
import { CalendarToggle } from './_src/components/calendar-toggle';

export default async function CalendarPage() {
  let events = await getCalendarEvents();

  if (!events) {
    return (events = []);
  }

  return (
    <div className="space-y-8 p-8">
      <CalendarToggle events={events} />
    </div>
  );
}
