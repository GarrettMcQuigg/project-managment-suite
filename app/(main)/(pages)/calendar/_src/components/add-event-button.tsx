'use client';

import { useState } from 'react';
import { Button } from '@/packages/lib/components/button';
import { PlusIcon } from 'lucide-react';
import { CalendarEventDialog } from './calendar-event-dialog';

export function AddEventButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:block">Add Event</span>
      </Button>

      <CalendarEventDialog open={open} onOpenChange={setOpen} mode="create" />
    </>
  );
}
