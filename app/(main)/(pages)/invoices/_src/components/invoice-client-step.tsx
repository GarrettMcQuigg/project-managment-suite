'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/lib/components/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Avatar, AvatarFallback } from '@packages/lib/components/avatar';
import { Input } from '@/packages/lib/components/input';
import { Label } from '@/packages/lib/components/label';
import { UseFormReturn } from 'react-hook-form';
import useSWR from 'swr';
import { API_CLIENT_LIST_ROUTE } from '@/packages/lib/routes';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { Client } from '@prisma/client';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { ClientFormValues } from '../../../clients/[id]/_src/types';

interface InvoiceClientStepProps {
  form: UseFormReturn<{ client: ClientFormValues }>;
  onValidationChange?: (isValid: boolean) => void;
}

export default function InvoiceClientStep({ form, onValidationChange }: InvoiceClientStepProps) {
  const [clientList, setClientList] = useState<Client[]>([]);
  const { data } = useSWR(API_CLIENT_LIST_ROUTE, swrFetcher);

  const clientName = form.watch('client.name');
  const clientEmail = form.watch('client.email');
  const clientPhone = form.watch('client.phone');

  useEffect(() => {
    if (data) {
      setClientList(data.content);
    }
  }, [data]);

  useEffect(() => {
    const validateClient = () => {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail || '');
      const isValidPhone = /^\+?[\d\s-]{10,}$/.test(clientPhone || '');
      const isValid = Boolean(clientName && clientName.length >= 2 && isValidEmail && isValidPhone);
      onValidationChange?.(isValid);
    };

    validateClient();
  }, [clientName, clientEmail, clientPhone, onValidationChange]);

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clientList.find((client) => client.id.toString() === clientId);
    if (selectedClient) {
      form.setValue('client', {
        id: selectedClient.id.toString(),
        name: selectedClient.name,
        email: selectedClient.email,
        phone: selectedClient.phone
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Client</TabsTrigger>
          <TabsTrigger value="existing">Existing Client</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="client.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client name" className="border-foreground/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter client email" className="border-foreground/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client phone" className="border-foreground/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="existing" className="mt-4">
          <div className="py-4">
            <Label>Select Client</Label>
            <Select onValueChange={handleClientSelect} value={form.getValues('client.id') || ''}>
              <SelectTrigger className="border-foreground/20">
                <SelectValue placeholder="Choose an existing client..." />
              </SelectTrigger>
              <SelectContent>
                {clientList.map((client) => (
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
