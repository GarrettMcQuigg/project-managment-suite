'use client';

import { Button } from '@/packages/lib/components/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { InvoiceForm } from './invoice-form';
import { toast } from 'react-toastify';
import { API_INVOICE_ADD_ROUTE, API_INVOICE_LIST_ROUTE } from '@/packages/lib/routes';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { ClientFormValues } from '../../../clients/[id]/_src/types';
import { mutate } from 'swr';

export function InvoiceHeader() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateInvoice = async (formData: {
    invoiceNumber?: string;
    type?: string;
    status?: string;
    dueDate?: Date;
    notes?: string | null;
    amount?: string;
    notifyClient?: boolean;
    projectId?: string;
    client: ClientFormValues;
  }) => {
    try {
      const response = await fetcher({
        url: API_INVOICE_ADD_ROUTE,
        requestBody: {
          ...formData
        }
      });

      if (response.err) {
        toast.error('Failed to create invoice');
        return;
      }

      setIsCreateDialogOpen(false);
      mutate(API_INVOICE_LIST_ROUTE);
      toast.success('Invoice created successfully');
      window.location.reload(); // Refresh to show new invoice
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  const handleCancel = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        New Invoice
      </Button>

      <InvoiceForm isOpen={isCreateDialogOpen} onSubmit={handleCreateInvoice} onCancel={handleCancel} />
    </div>
  );
}
