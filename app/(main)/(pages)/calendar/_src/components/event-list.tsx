import { CalendarEvent } from '@prisma/client';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface EventListProps {
  events: CalendarEvent[];
}

export default function EventList({ events }: EventListProps) {
  const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <div className="group relative overflow-hidden rounded-lg bg-card shadow-md transition-all duration-300 hover:shadow-lg dark:shadow-lg dark:shadow-primary/5 dark:hover:shadow-primary/10">
      <div className="absolute inset-0 rounded-lg border border-border/50" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 transition-colors duration-300 group-hover:from-primary/10 group-hover:to-accent/10 dark:from-primary/10 dark:via-transparent dark:to-accent/10 dark:group-hover:from-primary/15 dark:group-hover:to-accent/15" />

      <div className="relative z-10 p-6">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">Upcoming Events</h2>
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <div key={event.id} className="group/event relative overflow-hidden rounded-lg border border-border/50 bg-background/50 p-4 transition-colors hover:bg-accent/10">
              <h3 className="font-medium text-card-foreground">{event.title}</h3>
              <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(event.startDate, 'PPP')} at {format(event.startDate, 'p')}
                </span>
              </div>
              {event.description && <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>}
              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${
                    event.status === 'SCHEDULED'
                      ? 'bg-primary/20 text-primary-foreground'
                      : event.status === 'IN_PROGRESS'
                      ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                      : event.status === 'COMPLETED'
                      ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
              >
                {event.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/60 via-primary/80 to-accent/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
