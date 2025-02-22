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
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Event
      </Button>

      <CalendarEventDialog open={open} onOpenChange={setOpen} mode="create" />
    </>
  );
}
