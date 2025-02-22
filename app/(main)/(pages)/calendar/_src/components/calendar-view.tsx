'use client';

import { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/packages/lib/components/button';
import { CalendarEventDialog } from './calendar-event-dialog';
import { CalendarEventWithMetadata } from '@/packages/lib/prisma/types';

moment.locale('en-GB');
const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  events: CalendarEventWithMetadata[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [view, setView] = useState('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithMetadata | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '0.375rem',
        color: 'hsl(var(--primary-foreground))',
        border: 'none'
      }
    };
  };

  const handleSelectEvent = (event: CalendarEventWithMetadata) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setIsDialogOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const getDefaultValues = () => {
    if (selectedEvent) {
      return {
        id: selectedEvent.id,
        title: selectedEvent.title,
        description: selectedEvent.description || '',
        startDate: moment(selectedEvent.startDate).format('YYYY-MM-DDTHH:mm'),
        endDate: selectedEvent.endDate ? moment(selectedEvent.endDate).format('YYYY-MM-DDTHH:mm') : undefined,
        isAllDay: selectedEvent.isAllDay ?? false,
        type: selectedEvent.type,
        status: selectedEvent.status,
        color: selectedEvent.color || '#000000',
        projectId: selectedEvent.projectId || undefined,
        phaseId: selectedEvent.phaseId || undefined,
        invoiceId: selectedEvent.invoiceId || undefined,
        clientId: selectedEvent.clientId || undefined,
        reminders: selectedEvent.reminders.map((reminder) => ({
          reminderTime: moment(reminder.reminderTime).format('YYYY-MM-DDTHH:mm'),
          types: {
            email: reminder.emailEnabled,
            phone: reminder.phoneEnabled,
            notification: reminder.notificationEnabled
          }
        }))
      };
    }

    if (selectedSlot) {
      return {
        title: '',
        description: '',
        startDate: moment(selectedSlot.start).format('YYYY-MM-DDTHH:mm'),
        endDate: moment(selectedSlot.end).format('YYYY-MM-DDTHH:mm'),
        isAllDay: false,
        type: 'CUSTOM' as const,
        status: 'SCHEDULED' as const,
        color: '#000000',
        reminders: []
      };
    }

    return undefined;
  };

  const components = {
    toolbar: CustomToolbar
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg bg-card shadow-md transition-all duration-300 hover:shadow-lg dark:shadow-lg dark:shadow-primary/5 dark:hover:shadow-primary/10">
        <div className="absolute inset-0 rounded-lg border border-border/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 transition-colors duration-300 group-hover:from-primary/10 group-hover:to-accent/10 dark:from-primary/10 dark:via-transparent dark:to-accent/10 dark:group-hover:from-primary/15 dark:group-hover:to-accent/15" />
        <div className="relative z-10 [&_.rbc-header]:!bg-muted/50 [&_.rbc-header]:!text-muted-foreground [&_.rbc-header]:!border-border/50 [&_.rbc-month-view]:!border-border/50 [&_.rbc-month-view]:!bg-card [&_.rbc-off-range-bg]:!bg-muted/30 [&_.rbc-today]:!bg-accent/30 [&_.rbc-calendar]:!text-card-foreground [&_.rbc-time-content]:!border-border/50 [&_.rbc-time-header]:!border-border/50 [&_.rbc-time-header-content]:!border-border/50 [&_.rbc-timeslot-group]:!border-border/50 [&_.rbc-time-slot]:!text-muted-foreground">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="startDate"
            endAccessor="endDate"
            style={{ height: 600 }}
            views={['month', 'week', 'day']}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            view={view as any}
            onView={(newView) => setView(newView)}
            eventPropGetter={eventStyleGetter}
            components={components}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/60 via-primary/80 to-accent/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <CalendarEventDialog open={isDialogOpen} onOpenChange={handleCloseDialog} mode={selectedEvent ? 'edit' : 'create'} defaultValues={getDefaultValues()} />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomToolbar = (toolbar: any) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => toolbar.onNavigate('PREV')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => toolbar.onNavigate('NEXT')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="secondary" onClick={() => toolbar.onNavigate('TODAY')}>
          Today
        </Button>
      </div>
      <span className="text-lg font-semibold">{toolbar.label}</span>
      <div className="flex gap-2">
        {['month', 'week', 'day'].map((view) => (
          <Button key={view} variant={toolbar.view === view ? 'default' : 'secondary'} onClick={() => toolbar.onView(view)} className="capitalize">
            {view}
          </Button>
        ))}
      </div>
    </div>
  );
};
