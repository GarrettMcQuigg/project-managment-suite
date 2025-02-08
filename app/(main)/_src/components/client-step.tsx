'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/lib/components/tabs';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ClientFormValues, clients } from '../../(pages)/clients/[id]/_src/types';
import { Input } from '@/packages/lib/components/input';
import { ProjectFormData } from './project-step';
import { ExistingClientSelect } from '../../(pages)/clients/[id]/_src/existing-client-select';
import { Button } from '@/packages/lib/components/button';
import { Plus, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ClientStepProps {
  form: UseFormReturn<ProjectFormData & { id?: string }>;
  mode?: 'create' | 'edit';
}

const ClientStep: React.FC<ClientStepProps> = ({ form, mode = 'create' }) => {
  const [isNewClientForm, setIsNewClientForm] = useState(false);
  const originalClientDataRef = useRef(form.getValues('client'));
  const clientForm = useForm<ClientFormValues>();

  useEffect(() => {
    const currentClient = form.getValues('client');
    if (currentClient?.id && !isNewClientForm) {
      originalClientDataRef.current = { ...currentClient };
    }
  }, [form, isNewClientForm]);

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id.toString() === clientId);
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
    form.setValue('client.id', '');
    form.setValue('client.name', '');
    form.setValue('client.email', '');
    form.setValue('client.phone', '');
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
      <Tabs defaultValue={mode === 'edit' ? 'edit' : 'new'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">{mode === 'edit' ? 'Edit Client' : 'New Client'}</TabsTrigger>
          <TabsTrigger value="existing">Existing Client</TabsTrigger>
        </TabsList>

        <Button
          type="button"
          variant="outline"
          onClick={isNewClientForm ? handleRestoreOriginalClient : handleCreateNewClick}
          className="w-full mt-4 mb-2"
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

        <TabsContent value="edit" className="space-y-4">
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
            <ExistingClientSelect form={clientForm} onSelect={handleClientSelect} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientStep;
