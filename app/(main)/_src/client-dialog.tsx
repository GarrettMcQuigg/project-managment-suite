'use client';

import { Button } from '@/packages/lib/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/packages/lib/components/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Avatar, AvatarFallback } from '@packages/lib/components/avatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';

const clientFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required')
});

const clients = [
  {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@aol.com',
    phone: '555-555-5555',
    isArchived: false
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'janedoe@aol.com',
    phone: '777-777-5555',
    isArchived: false
  }
];

export type ClientFormValues = z.infer<typeof clientFormSchema>;

type ClientDetailsDialogProps = {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientFormValues) => void;
  onBack?: () => void;
  defaultValues?: ClientFormValues;
  mode?: 'create' | 'edit';
};

const NewClientForm = ({ form }: { form: any }) => (
  <>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Client name</FormLabel>
          <FormControl>
            <Input {...field} className="border-purple-500/20" placeholder="John Smith" />
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
            <Input {...field} type="email" className="border-purple-500/20" placeholder="johnsmith@gmail.com" />
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
            <Input {...field} type="tel" className="border-purple-500/20" placeholder="(123) 456 - 7890" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

export function ClientDialog({ children, open, onOpenChange, onSubmit, onBack, defaultValues, mode = 'create' }: ClientDetailsDialogProps) {
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('new');
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (!open) {
      form.reset(
        defaultValues || {
          name: '',
          email: '',
          phone: ''
        }
      );
    }
  }, [open, form, defaultValues]);

  const handleExistingClientSelect = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id.toString() === clientId);
    if (selectedClient) {
      form.setValue('name', selectedClient.name);
      form.setValue('email', selectedClient.email);
      form.setValue('phone', selectedClient.phone);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}

      <DialogContent className="sm:max-w-[500px] bg-background backdrop-blur-xl bg-gradient-to-br from-purple-500/15 via-background/60 to-background/90">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Client' : 'Client Details'}</DialogTitle>
          <DialogDescription>{mode === 'edit' ? 'Update client information' : 'Enter information about a new client'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            {onBack ? (
              <Tabs defaultValue={clientMode} className="w-full" onValueChange={(value) => setClientMode(value as 'existing' | 'new')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="new">New Client</TabsTrigger>
                  <TabsTrigger value="existing">Existing Client</TabsTrigger>
                </TabsList>

                <TabsContent value="existing">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Client</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleExistingClientSelect(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl className="py-8 px-4">
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an existing client..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem
                                key={client.id}
                                value={client.id.toString()}
                                className="w-full my-1 data-[highlighted]:bg-purple-800/15 data-[state=checked]:bg-purple-800/30 cursor-pointer"
                              >
                                <div className="w-full flex gap-2">
                                  <Avatar>
                                    <AvatarFallback>
                                      {client.name
                                        .split(' ')
                                        .map((chunk) => chunk[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="font-medium">{client.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {client.email} • {client.phone}
                                    </span>
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
                </TabsContent>

                <TabsContent value="new">
                  <NewClientForm form={form} />
                </TabsContent>
              </Tabs>
            ) : (
              <NewClientForm form={form} />
            )}

            <DialogFooter className="flex justify-between gap-2">
              {onBack ? (
                <>
                  <Button type="button" variant="outline" onClick={onBack} className="border-purple-500/20 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Project
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Create Project
                  </Button>
                </>
              ) : (
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  {mode === 'edit' ? 'Update Client' : 'Create Client'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
