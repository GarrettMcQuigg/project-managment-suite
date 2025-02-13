'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { Button } from '@/packages/lib/components/button';
import { ArrowLeft, ArrowRight, Router } from 'lucide-react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { API_CLIENT_ADD_ROUTE, API_CLIENT_UPDATE_ROUTE, API_CLIENT_LIST_ROUTE } from '@/packages/lib/routes';
import { clientFormSchema, type ClientFormValues } from './types';
import { UpdateClientRequestBody } from '@/app/api/client/update/types';
import { AddClientRequestBody } from '@/app/api/client/add/types';
import { useRouter } from 'next/navigation';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  defaultValues?: ClientFormValues;
  mode?: 'create' | 'edit';
  endpoint?: string;
}

export function ClientFormDialog({ open, onOpenChange, onBack, defaultValues, mode = 'create', endpoint }: ClientFormDialogProps) {
  const router = useRouter();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  const handleSubmit = async (data: ClientFormValues) => {
    try {
      if (mode === 'create') {
        const requestBody: AddClientRequestBody = {
          name: data.name,
          email: data.email,
          phone: data.phone
        };

        const response = await fetcher({
          url: API_CLIENT_ADD_ROUTE,
          requestBody,
          method: HttpMethods.POST
        });

        if (response.err) {
          toast.error('Failed to create client');
          return;
        }

        toast.success('Client created successfully');
      } else {
        const requestBody: UpdateClientRequestBody = {
          id: defaultValues!.id!,
          name: data.name,
          email: data.email,
          phone: data.phone
        };

        const response = await fetcher({
          url: API_CLIENT_UPDATE_ROUTE,
          requestBody,
          method: HttpMethods.PUT
        });

        if (response.err) {
          toast.error('Failed to update client');
          return;
        }

        toast.success('Client updated successfully');
      }

      onOpenChange(false);
      if (endpoint) {
        mutate(endpoint);
        router.refresh();
      }
      mutate(API_CLIENT_LIST_ROUTE);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-foreground/10 via-background to-background">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
          <DialogDescription>{mode === 'create' ? 'Create a new client' : 'Update client information'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
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

            <DialogFooter className="flex w-full items-center">
              <div className="flex w-full justify-between">
                {onBack && (
                  <Button type="button" variant="ghost" onClick={onBack} className="border-foreground/20">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}

                <Button type="submit" variant="ghost" className="text-primary hover:text-primary ml-auto">
                  {mode === 'create' ? 'Create' : 'Update'} Client
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
