'use client';

import { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../calendar-dark-theme.css';
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
  const [date, setDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithMetadata | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const eventStyleGetter = (event: CalendarEventWithMetadata) => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const getEventColor = () => {
      if (event.color && event.color !== '#000000') return event.color;
      switch (event.type) {
        case 'PROJECT_TIMELINE':
          return '#3b82f6';
        case 'CHECKPOINT_DEADLINE':
          return '#f59e0b';
        case 'INVOICE_DUE':
          return '#ef4444';
        case 'CUSTOM':
          return '#8b5cf6';
        default:
          return 'hsl(var(--primary))';
      }
    };

    return {
      style: {
        backgroundColor: getEventColor(),
        borderRadius: '0.25rem',
        color: 'white',
        border: 'none',
        fontSize: duration > 7 ? '0.65rem' : '0.75rem',
        fontWeight: '600',
        padding: duration > 7 ? '1px 4px' : '2px 6px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.1)',
        height: duration > 7 ? '16px' : '20px',
        lineHeight: duration > 7 ? '14px' : '16px',
        opacity: duration > 7 ? 0.9 : 1
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
        checkpointId: selectedEvent.checkpointId || undefined,
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

  const CustomEvent = ({ event }: { event: CalendarEventWithMetadata }) => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="flex items-center gap-1 w-full">
        <div className="w-2 h-2 rounded-full bg-white/80 flex-shrink-0" />
        <span className="truncate">{duration > 1 ? `${event.title} (${duration}d)` : event.title}</span>
      </div>
    );
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  const CustomDateHeader = ({ date, label }: { date: Date; label: string }) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    return (
      <div className="flex justify-end items-center h-full pr-2 py-1">
        {isToday && view === 'month' ? (
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'hsl(var(--primary))' }}>
            {label}
          </div>
        ) : (
          <span className="py-1">{label}</span>
        )}
      </div>
    );
  };

  const components = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolbar: (props: any) => <CustomToolbar {...props} onNavigate={handleNavigate} onView={handleViewChange} date={date} view={view} />,
    event: CustomEvent,
    month: {
      dateHeader: CustomDateHeader
    }
  };

  return (
    <>
      <div className="relative bg-card dark:bg-card/80 rounded-2xl shadow-lg border border-border">
        <div className="relative z-10">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="startDate"
            endAccessor="endDate"
            style={{ height: 800 }}
            views={['month', 'week', 'day']}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            view={view as any}
            date={date}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            components={components}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </div>
      </div>

      <CalendarEventDialog open={isDialogOpen} onOpenChange={handleCloseDialog} mode={selectedEvent ? 'edit' : 'create'} defaultValues={getDefaultValues()} />
    </>
  );
}

interface CustomToolbarProps {
  date: Date;
  view: string;
  label: string;
  onNavigate: (date: Date) => void;
  onView: (view: string) => void;
}

const CustomToolbar = (toolbar: CustomToolbarProps) => {
  const handlePrevious = () => {
    const newDate = new Date(toolbar.date);
    if (toolbar.view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (toolbar.view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (toolbar.view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    toolbar.onNavigate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(toolbar.date);
    if (toolbar.view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (toolbar.view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (toolbar.view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    toolbar.onNavigate(newDate);
  };

  const handleToday = () => {
    toolbar.onNavigate(new Date());
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="secondary" onClick={handleToday}>
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
