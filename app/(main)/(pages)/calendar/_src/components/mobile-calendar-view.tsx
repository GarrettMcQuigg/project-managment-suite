'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
import { CalendarEventDialog } from './calendar-event-dialog';
import { CalendarEventWithMetadata } from '@/packages/lib/prisma/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';

interface MobileCalendarViewProps {
  events: CalendarEventWithMetadata[];
}

export default function MobileCalendarView({ events }: MobileCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithMetadata | null>(null);

  // Get all days in current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for selected date
  const selectedDateEvents = events.filter(event => 
    isSameDay(new Date(event.startDate), selectedDate)
  );

  // Get event color
  const getEventColor = (event: CalendarEventWithMetadata) => {
    if (event.color && event.color !== '#000000') return event.color;
    switch (event.type) {
      case 'PROJECT_TIMELINE': return '#3b82f6';
      case 'CHECKPOINT_DEADLINE': return '#f59e0b';
      case 'INVOICE_DUE': return '#ef4444';
      case 'CUSTOM': return '#8b5cf6';
      default: return 'hsl(var(--primary))';
    }
  };

  // Check if date has events
  const hasEvents = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.startDate), date));
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEventWithMetadata) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  const getDefaultValues = () => {
    if (selectedEvent) {
      return {
        id: selectedEvent.id,
        title: selectedEvent.title,
        description: selectedEvent.description || '',
        startDate: format(new Date(selectedEvent.startDate), 'yyyy-MM-dd\'T\'HH:mm'),
        endDate: selectedEvent.endDate ? format(new Date(selectedEvent.endDate), 'yyyy-MM-dd\'T\'HH:mm') : undefined,
        isAllDay: selectedEvent.isAllDay ?? false,
        type: selectedEvent.type,
        status: selectedEvent.status,
        color: selectedEvent.color || '#000000',
        projectId: selectedEvent.projectId || undefined,
        checkpointId: selectedEvent.checkpointId || undefined,
        invoiceId: selectedEvent.invoiceId || undefined,
        clientId: selectedEvent.clientId || undefined,
        reminders: selectedEvent.reminders.map((reminder) => ({
          reminderTime: format(new Date(reminder.reminderTime), 'yyyy-MM-dd\'T\'HH:mm'),
          types: {
            email: reminder.emailEnabled,
            phone: reminder.phoneEnabled,
            notification: reminder.notificationEnabled
          }
        }))
      };
    }

    return {
      title: '',
      description: '',
      startDate: format(selectedDate, 'yyyy-MM-dd\'T\'HH:mm'),
      endDate: format(selectedDate, 'yyyy-MM-dd\'T\'HH:mm'),
      isAllDay: false,
      type: 'CUSTOM' as const,
      status: 'SCHEDULED' as const,
      color: '#000000',
      reminders: []
    };
  };

  return (
    <>
      <div className="bg-card rounded-2xl shadow-lg border border-border">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mini Calendar Grid */}
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date) => {
              const isSelectedDate = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const hasEventsOnDate = hasEvents(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    aspect-square p-2 text-sm rounded-md transition-colors relative
                    ${isSelectedDate 
                      ? 'bg-primary text-primary-foreground' 
                      : isTodayDate 
                        ? 'bg-primary/10 text-primary font-semibold' 
                        : 'hover:bg-muted'
                    }
                    ${!isSameMonth(date, currentDate) ? 'text-muted-foreground/50' : ''}
                  `}
                >
                  {format(date, 'd')}
                  {hasEventsOnDate && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="border-t border-border/50">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h3 className="font-semibold">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            <Button variant="ghost" size="icon" onClick={handleAddEvent}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {selectedDateEvents.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No events for this day
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {selectedDateEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: getEventColor(event) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.isAllDay 
                            ? 'All day'
                            : `${format(new Date(event.startDate), 'h:mm a')}${
                                event.endDate && !isSameDay(new Date(event.startDate), new Date(event.endDate))
                                  ? ` - ${format(new Date(event.endDate), 'h:mm a')}`
                                  : ''
                              }`
                          }
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CalendarEventDialog 
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog} 
        mode={selectedEvent ? 'edit' : 'create'} 
        defaultValues={getDefaultValues()} 
      />
    </>
  );
}