import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';
import { Client } from '@prisma/client';

export const clientFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required')
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export interface ClientCardProps {
  client: ClientFormValues;
  form: UseFormReturn<ClientFormValues>;
  onEdit: () => void;
  isEditing: boolean;
}

export interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientFormValues) => void;
  onBack?: () => void;
  defaultValues?: ClientFormValues;
  mode: 'create' | 'edit';
}

export interface NewClientFormProps {
  form: UseFormReturn<ClientFormValues>;
}

export interface ExistingClientSelectProps {
  form: UseFormReturn<ClientFormValues>;
  clientList: Client[];
  onSelect: (clientId: string) => void;
}

export type ViewState = 'view' | 'select' | 'new';
