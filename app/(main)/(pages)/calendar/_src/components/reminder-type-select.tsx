import { Control } from 'react-hook-form';
import { CalendarEventFormValues } from './calendar-event-dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/packages/lib/components/form';
import { Switch } from '@/packages/lib/components/switch';

interface ReminderTypeSelectProps {
  index: number;
  control: Control<CalendarEventFormValues>;
}

export function ReminderTypeSelect({ index, control }: ReminderTypeSelectProps) {
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

      <FormField control={control} name={`reminders.${index}.types`} render={() => <FormMessage />} />
    </div>
  );
}
