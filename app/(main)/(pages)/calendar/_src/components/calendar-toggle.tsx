'use client';

import { useState, useEffect } from 'react';
import { Calendar, List } from 'lucide-react';
import CalendarView from './calendar-view';
import MobileCalendarView from './mobile-calendar-view';
import EventList from './event-list';
import { AddEventButton } from './add-event-button';

type ViewMode = 'calendar' | 'events';

interface CalendarToggleProps {
  events: any[];
}

export function CalendarToggle({ events }: CalendarToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{viewMode === 'calendar' ? 'Calendar' : 'Upcoming Events'}</h1>
        <AddEventButton />
      </div>

      <div className="flex items-center justify-center">
        <div className="relative bg-muted rounded-lg p-1 flex">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="flex items-center gap-1">
              Calendar <span className="hidden md:block">View</span>
            </span>
          </button>
          <button
            onClick={() => setViewMode('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'events' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="flex items-center gap-1">
              Events <span className="hidden md:block">View</span>
            </span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? isMobile ? <MobileCalendarView events={events} /> : <CalendarView events={events} /> : <EventList events={events} />}
    </div>
  );
}
