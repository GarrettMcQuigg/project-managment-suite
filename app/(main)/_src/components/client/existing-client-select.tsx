'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Avatar, AvatarFallback } from '@packages/lib/components/avatar';
import type { ExistingClientSelectProps } from './types';
import { clients } from './types';

export const ExistingClientSelect = ({ form, onSelect }: ExistingClientSelectProps) => (
  <FormField
    control={form.control}
    name="id"
    render={({ field }) => (
      <FormItem>
        <Select
          onValueChange={(value) => {
            field.onChange(value);
            onSelect(value);
          }}
          defaultValue={field.value}
        >
          <FormControl>
            <SelectTrigger className="border-foreground/20">
              <SelectValue placeholder="Choose an existing client..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()} className="py-2 data-[highlighted]:bg-foreground/15">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {client.name
                        .split(' ')
                        .map((chunk) => chunk[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    <span className="text-xs text-muted-foreground">{client.email}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);
