'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import type { NewClientFormProps } from './types';

export const NewClientForm = ({ form }: NewClientFormProps) => (
  <>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Client name</FormLabel>
          <FormControl>
            <Input {...field} className="border-foreground/20" placeholder="John Smith" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} type="email" className="border-foreground/20" placeholder="johnsmith@gmail.com" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Phone</FormLabel>
          <FormControl>
            <Input {...field} type="tel" className="border-foreground/20" placeholder="(123) 456-7890" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);
