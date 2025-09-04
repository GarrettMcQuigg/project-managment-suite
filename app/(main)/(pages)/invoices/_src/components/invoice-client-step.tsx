'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/lib/components/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Avatar, AvatarFallback } from '@packages/lib/components/avatar';
import { Input } from '@/packages/lib/components/input';
import { useForm, UseFormReturn } from 'react-hook-form';
import useSWR from 'swr';
import { API_CLIENT_LIST_ROUTE } from '@/packages/lib/routes';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { Client } from '@prisma/client';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { ClientFormValues } from '../../../clients/[id]/_src/types';

interface InvoiceClientStepProps {
  form: UseFormReturn<{ client: ClientFormValues }>;
  onValidationChange?: (isValid: boolean) => void;
  clearForms?: boolean;
}

export default function InvoiceClientStep({ form, onValidationChange, clearForms }: InvoiceClientStepProps) {
  const [clientList, setClientList] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const { data } = useSWR(API_CLIENT_LIST_ROUTE, swrFetcher);
  const clientForm = useForm<{ id: string }>();

  const clientName = form.watch('client.name');
  const clientEmail = form.watch('client.email');
  const clientPhone = form.watch('client.phone');

  useEffect(() => {
    if (data) {
      setClientList(data.content);
    }
  }, [data]);

  useEffect(() => {
    const clientId = form.getValues('client.id');
    const clientName = form.getValues('client.name');

    if (clientId && clientId.length > 0) {
      setActiveTab('existing');
      clientForm.setValue('id', clientId);
    } else if (clientName && clientName.length > 0) {
      setActiveTab('new');
    } else {
      setActiveTab('new');
    }
  }, []);

  useEffect(() => {
    if (clearForms) {
      form.setValue('client', {
        name: '',
        email: '',
        phone: ''
      });
      clientForm.reset({ id: '' });
      setActiveTab('new');
    }
  }, [clearForms, form, clientForm]);

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
      form.trigger(['client.name', 'client.email', 'client.phone']);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'new' | 'existing');

    if (value === 'new') {
      const currentClientId = form.getValues('client.id');
      if (currentClientId) {
        form.setValue('client', {
          id: undefined,
          name: '',
          email: '',
          phone: ''
        });
        clientForm.setValue('id', '');
      }
    }
  };

  const handleNewClientInput = () => {
    clientForm.setValue('id', '');
    form.setValue('client.id', undefined);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                  <Input placeholder="Enter client name" className="border-foreground/20" {...field} onFocus={handleNewClientInput} />
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
                  <Input type="email" placeholder="Enter client email" className="border-foreground/20" {...field} onFocus={handleNewClientInput} />
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
                  <Input placeholder="Enter client phone" className="border-foreground/20" {...field} onFocus={handleNewClientInput} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="existing" className="mt-4">
          <div className="py-4">
            <FormField
              control={clientForm.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleClientSelect(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-foreground/20">
                        <SelectValue placeholder="Choose an existing client..." />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
