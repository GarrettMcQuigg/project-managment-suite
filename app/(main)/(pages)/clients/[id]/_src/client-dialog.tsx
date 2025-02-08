'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Form } from '@/packages/lib/components/form';
import { Button } from '@/packages/lib/components/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/packages/lib/components/tabs';
import { ArrowLeft, ArrowRight, UserPlus, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { API_CLIENT_UPDATE_ROUTE } from '@/packages/lib/routes';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { UpdateClientRequestBody } from '@/app/api/client/update/types';
import { ClientDialogProps, clientFormSchema, ClientFormValues, clients, ViewState } from './types';
import { ClientCard } from './client-card';
import { ExistingClientSelect } from './existing-client-select';
import { NewClientForm } from './new-client-form';

export function ClientDialog({ open, onOpenChange, onSubmit, onBack, defaultValues, mode = 'create' }: ClientDialogProps) {
  const [view, setView] = useState<ViewState>(mode === 'edit' ? 'view' : 'new');
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      phone: ''
    }
  });

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id.toString() === clientId);
    if (selectedClient) {
      form.reset({
        id: clientId,
        name: selectedClient.name,
        email: selectedClient.email,
        phone: selectedClient.phone
      });
      if (mode === 'edit') {
        setView('view');
      }
    }
  };

  const handleSubmit = async (values: ClientFormValues) => {
    if (mode === 'edit' && defaultValues?.id) {
      const hasChanged = Object.keys(values).some((key) => values[key as keyof ClientFormValues] !== defaultValues[key as keyof ClientFormValues]);

      if (hasChanged) {
        const { name, email, phone } = values;
        try {
          const requestBody: UpdateClientRequestBody = {
            id: defaultValues!.id,
            name,
            email,
            phone
          };

          const response = await fetcher({ url: API_CLIENT_UPDATE_ROUTE, requestBody, method: HttpMethods.PUT });

          if (response.err) {
            toast.error('Failed to create project');
            return;
          }

          // mutate(endpoint);
          toast.success('Client updated successfully');
        } catch (error) {
          console.error(error);
          toast.error('An error occurred');
        }
      } else {
        setIsEditing(false);
      }
    } else {
      onSubmit(values);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      form.reset(defaultValues);
    }
    setIsEditing(!isEditing);
  };

  if (mode === 'edit') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-foreground/10 via-background to-background">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>Review or update client information</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 pt-4">
              {view === 'view' && defaultValues && (
                <div className="space-y-4">
                  <ClientCard client={defaultValues} form={form} onEdit={toggleEdit} isEditing={isEditing} />

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="w-full border-foreground/20" onClick={() => setView('select')}>
                      <Users className="w-4 h-4 mr-2" />
                      Change Client
                    </Button>
                    <Button type="button" variant="outline" className="w-full border-foreground/20" onClick={() => setView('new')}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create New
                    </Button>
                  </div>
                </div>
              )}

              {view === 'select' && (
                <div className="space-y-4">
                  <ExistingClientSelect form={form} onSelect={handleClientSelect} />
                  <Button type="button" variant="outline" className="w-full border-foreground/20" onClick={() => setView('view')}>
                    Cancel
                  </Button>
                </div>
              )}

              {view === 'new' && (
                <div className="space-y-4">
                  <NewClientForm form={form} />
                  <Button type="button" variant="outline" className="w-full border-foreground/20" onClick={() => setView('view')}>
                    Cancel
                  </Button>
                </div>
              )}

              <DialogFooter className="flex w-full items-center">
                <div className="flex w-full justify-between gap-2">
                  {onBack && (
                    <Button type="button" variant="ghost" onClick={onBack} className="border-foreground/20">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Client
                    </Button>
                  )}

                  {!isEditing && (
                    <div className="ml-auto">
                      <Button type="submit">Update Client</Button>
                    </div>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-foreground/10 via-background to-background">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
          <DialogDescription>Create a new client</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <NewClientForm form={form} />

            <DialogFooter className="flex w-full items-center">
              <div className="flex w-full justify-end">
                {onBack && (
                  <Button type="button" variant="ghost" onClick={onBack} className="border-foreground/20 mr-auto">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Project
                  </Button>
                )}

                <Button type="submit" variant="ghost" className="text-primary hover:text-primary">
                  Create Client
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
