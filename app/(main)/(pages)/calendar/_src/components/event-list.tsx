import { CalendarEvent } from '@prisma/client';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

interface EventListProps {
  events: CalendarEvent[];
}

const statusConfig = {
  SCHEDULED: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  IN_PROGRESS: { color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  COMPLETED: { color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  CANCELLED: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' }
};

export default function EventList({ events }: EventListProps) {
  const now = new Date();
  const upcomingEvents = events
    .filter((event) => {
      const eventEndDate = event.endDate || event.startDate;
      return eventEndDate > now;
    })
    .sort((a, b) => {
      const aEndDate = a.endDate || a.startDate;
      const bEndDate = b.endDate || b.startDate;
      return aEndDate.getTime() - bEndDate.getTime();
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="relative group perspective-1000">
            <div className="relative bg-card dark:bg-card/80 rounded-2xl shadow-lg hover:shadow-2xl shadow-primary/10 group-hover:shadow-primary/40 group-hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-1 group-hover:rotate-[0.5deg] border border-border">
              <div className="absolute -top-3 -right-3 z-10">
                <div
                  className={`px-4 py-2 rounded-full shadow-lg text-xs font-semibold ${statusConfig[event.status as keyof typeof statusConfig]?.color || statusConfig.SCHEDULED.color} backdrop-blur-sm`}
                >
                  {event.status}
                </div>
              </div>

              <div className="p-8">
                <div className="relative -m-8 mb-6 p-8 bg-gradient-to-br from-primary/5 to-secondary/10 dark:from-primary/10 dark:to-secondary/20 rounded-t-2xl backdrop-blur-[1px]">
                  <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 break-words">{event.title}</h3>
                  <p className="text-foreground/70 text-sm line-clamp-2 break-words">{event.description || 'No description provided'}</p>
                </div>

                <div className="flex items-center justify-between mt-12">
                  <div className="flex justify-between w-full text-sm text-foreground/70">
                    <div className="flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-2 text-primary/70" />
                      <span>
                        Start Date: <b>{format(event.startDate, 'MMM dd, yyyy')}</b>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-primary/70" />
                      <span>
                        End Date: <b>{event.endDate && format(event.endDate, 'MMM dd, yyyy')}</b>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
