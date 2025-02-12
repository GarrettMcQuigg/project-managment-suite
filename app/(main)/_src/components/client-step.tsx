'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/lib/components/tabs';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '../../(pages)/clients/[id]/_src/types';
import { Input } from '@/packages/lib/components/input';
import { ProjectFormData } from './project-step';
import { ExistingClientSelect } from '../../(pages)/clients/[id]/_src/existing-client-select';
import { Button } from '@/packages/lib/components/button';
import { Plus, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { API_CLIENT_LIST_ROUTE } from '@/packages/lib/routes';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { Client } from '@prisma/client';

interface ClientStepProps {
  form: UseFormReturn<ProjectFormData & { id?: string }>;
  mode?: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
}

const ClientStep: React.FC<ClientStepProps> = ({ form, mode = 'create', onValidationChange }) => {
  const [isNewClientForm, setIsNewClientForm] = useState(false);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [currentClient, setCurrentClient] = useState<ClientFormValues>(form.getValues('client'));
  const { data, error } = useSWR(API_CLIENT_LIST_ROUTE, swrFetcher);
  const originalClientDataRef = useRef(form.getValues('client'));
  const clientForm = useForm<ClientFormValues>();

  const clientName = form.watch('client.name');
  const clientEmail = form.watch('client.email');
  const clientPhone = form.watch('client.phone');

  useEffect(() => {
    if (data) {
      console.log('data', data.content);
      setClientList(data.content);
    }
  }, [data, error]);

  useEffect(() => {
    const hasCurrentClient = form.getValues('client');
    if (hasCurrentClient?.id && !isNewClientForm) {
      setCurrentClient(hasCurrentClient);
      originalClientDataRef.current = { ...hasCurrentClient };
    }

    if (hasCurrentClient?.id && hasCurrentClient.email === 'system@deleted.client') {
      form.setValue('client', {
        id: undefined,
        name: '',
        email: '',
        phone: ''
      });

      setIsNewClientForm(true);
    }
  }, [form, isNewClientForm]);

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
      setIsNewClientForm(false);
      const clientData = {
        id: selectedClient.id.toString(),
        name: selectedClient.name,
        email: selectedClient.email,
        phone: selectedClient.phone
      };
      originalClientDataRef.current = { ...clientData };
      form.setValue('client', clientData);
    }
  };

  const handleCreateNewClick = () => {
    setIsNewClientForm(true);
    form.setValue('client', {
      id: undefined,
      name: '',
      email: '',
      phone: ''
    });
  };

  const handleRestoreOriginalClient = () => {
    setIsNewClientForm(false);
    const originalData = originalClientDataRef.current;
    if (originalData?.id) {
      const restoredData = { ...originalData };
      form.setValue('client', restoredData);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">{mode === 'create' ? 'New Client' : 'Edit Client'}</TabsTrigger>
          <TabsTrigger value="existing">Existing Client</TabsTrigger>
        </TabsList>

        <Button
          type="button"
          variant="outline"
          onClick={isNewClientForm ? handleRestoreOriginalClient : handleCreateNewClick}
          className={mode === 'create' || currentClient.email === 'system@deleted.client' ? 'hidden' : 'w-full mt-4 mb-2'}
          disabled={!originalClientDataRef.current?.id && !isNewClientForm}
        >
          {isNewClientForm ? (
            <>
              <Undo2 className="h-4 w-4 mr-2" />
              Restore Original Client
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create New Client
            </>
          )}
        </Button>

        <TabsContent value="edit" className="space-y-4 mt-4">
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

        <TabsContent value="existing">
          <div className="py-4">
            <ExistingClientSelect form={clientForm} clientList={clientList} onSelect={handleClientSelect} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientStep;
