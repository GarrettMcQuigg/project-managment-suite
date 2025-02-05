import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/lib/components/tabs';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ExistingClientSelect } from './client/existing-client-select';
import { ClientFormValues, clients } from './client/types';
import { Input } from '@/packages/lib/components/input';
import { ProjectFormData } from './project-step';

interface ClientStepProps {
  form: UseFormReturn<ProjectFormData & { id?: string }>;
}

const ClientStep: React.FC<ClientStepProps> = ({ form }) => {
  const clientForm = useForm<ClientFormValues>();

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id.toString() === clientId);
    if (selectedClient) {
      form.setValue('client.id', selectedClient.id.toString());
      form.setValue('client.name', selectedClient.name);
      form.setValue('client.email', selectedClient.email);
      form.setValue('client.phone', selectedClient.phone);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Client</TabsTrigger>
          <TabsTrigger value="existing">Existing Client</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
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
