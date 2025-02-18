'use client';

import { useEffect } from 'react';
import { Control, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { Button } from '@/packages/lib/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Textarea } from '@/packages/lib/components/textarea';
import { Switch } from '@/packages/lib/components/switch';
import { ArrowLeft, ArrowRight, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { API_CALENDAR_EVENT_ADD_ROUTE, API_CALENDAR_EVENT_LIST_ROUTE, API_CALENDAR_EVENT_UPDATE_ROUTE } from '@/packages/lib/routes';
import { CalendarEventStatus, CalendarEventType } from '@prisma/client';

const reminderTypeSchema = z.object({
  email: z.boolean().default(false),
  phone: z.boolean().default(false),
  notification: z.boolean().default(false)
});

const calendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isAllDay: z.boolean().default(false),
  type: z
    .enum([
      CalendarEventType.PROJECT_TIMELINE,
      CalendarEventType.PHASE_DEADLINE,
      CalendarEventType.INVOICE_DUE,
      CalendarEventType.CLIENT_ANNIVERSARY,
      CalendarEventType.PLATFORM_MILESTONE,
      CalendarEventType.CUSTOM
    ])
    .default(CalendarEventType.CUSTOM),
  status: z
    .enum([CalendarEventStatus.SCHEDULED, CalendarEventStatus.IN_PROGRESS, CalendarEventStatus.COMPLETED, CalendarEventStatus.CANCELLED])
    .default(CalendarEventStatus.SCHEDULED),
  color: z.string().optional(),
  projectId: z.string().optional(),
  phaseId: z.string().optional(),
  invoiceId: z.string().optional(),
  clientId: z.string().optional(),
  reminders: z
    .array(
      z.object({
        reminderTime: z.string(),
        types: reminderTypeSchema
      })
    )
    .default([])
});

type CalendarEventFormValues = z.infer<typeof calendarEventSchema>;

interface ReminderTypeSelectProps {
  index: number;
  control: Control<CalendarEventFormValues>;
}

function ReminderTypeSelect({ index, control }: ReminderTypeSelectProps) {
  return (
    <div className="space-y-2">
      <FormField
        control={control}
        name={`reminders.${index}.types.email`}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="text-sm">Email</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`reminders.${index}.types.phone`}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="text-sm">Phone</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`reminders.${index}.types.notification`}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="text-sm">Notification</FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
}

interface CalendarEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  defaultValues?: CalendarEventFormValues;
  mode?: 'create' | 'edit';
  projects?: Array<{ id: string; name: string }>;
}

export function CalendarEventDialog({ open, onOpenChange, onBack, defaultValues, mode = 'create', projects }: CalendarEventDialogProps) {
  const router = useRouter();
  const form = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isAllDay: false,
      status: CalendarEventStatus.SCHEDULED,
      color: '#000000',
      reminders: []
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  const handleSubmit = async (data: CalendarEventFormValues) => {
    try {
      const requestBody = {
        ...data,
        reminders: data.reminders.map((reminder) => ({
          reminderTime: new Date(reminder.reminderTime).toISOString(),
          emailEnabled: reminder.types.email,
          phoneEnabled: reminder.types.phone,
          notificationEnabled: reminder.types.notification
        }))
      };

      const response = await fetcher({
        url: mode === 'create' ? API_CALENDAR_EVENT_ADD_ROUTE : API_CALENDAR_EVENT_UPDATE_ROUTE,
        requestBody,
        method: mode === 'create' ? HttpMethods.POST : HttpMethods.PUT
      });

      if (response.err) {
        toast.error(`Failed to ${mode} calendar event`);
        return;
      }

      const message = mode === 'create' ? 'Calendar event created successfully' : 'Calendar event updated successfully';
      toast.success(message);
      onOpenChange(false);

      router.refresh();
      mutate(API_CALENDAR_EVENT_LIST_ROUTE);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  const addReminder = () => {
    const currentReminders = form.getValues('reminders');
    form.setValue('reminders', [
      ...currentReminders,
      {
        reminderTime: '',
        types: {
          email: false,
          phone: false,
          notification: false
        }
      }
    ]);
  };

  const removeReminder = (index: number) => {
    const currentReminders = form.getValues('reminders');
    form.setValue(
      'reminders',
      currentReminders.filter((_, i) => i !== index)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-foreground/10 via-background to-background">
        <DialogHeader>
          <DialogTitle>Calendar Event</DialogTitle>
          <DialogDescription>{mode === 'create' ? 'Create a new calendar event' : 'Update calendar event'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-foreground/20" placeholder="Event title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="border-foreground/20" placeholder="Event description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" className="border-foreground/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" className="border-foreground/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isAllDay"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>All Day Event</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Related entity selectors based on event type */}
            {form.watch('type') === CalendarEventType.PROJECT_TIMELINE && projects && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-foreground/20">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Similar selectors for phases, invoices, and clients based on type */}

            {/* Reminder Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Reminders</h4>
                <Button type="button" variant="outline" size="sm" onClick={addReminder}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </Button>
              </div>

              {form.watch('reminders').map((_, index) => (
                <div key={index} className="grid grid-cols-[1fr,auto] gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`reminders.${index}.reminderTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} type="datetime-local" className="border-foreground/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <ReminderTypeSelect index={index} control={form.control} />
                  </div>

                  <Button type="button" variant="ghost" size="icon" onClick={() => removeReminder(index)} className="self-center">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter className="flex w-full items-center">
              <div className="flex w-full justify-between">
                {onBack && (
                  <Button type="button" variant="ghost" onClick={onBack} className="border-foreground/20">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}

                <Button type="submit" variant="ghost" className="text-primary hover:text-primary ml-auto">
                  {mode === 'create' ? 'Create' : 'Update'} Event
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
