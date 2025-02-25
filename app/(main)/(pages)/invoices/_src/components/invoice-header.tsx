'use client';

import { Button } from '@/packages/lib/components/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';
import { InvoiceForm } from './invoice-form';
import { mutate } from 'swr';
import { toast } from 'react-toastify';
import { API_INVOICE_ADD_ROUTE } from '@/packages/lib/routes';
import { fetcher } from '@/packages/lib/helpers/fetcher';

export function InvoiceHeader() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateInvoice = async (formData: Partial<InvoiceWithMetadata>) => {
    try {
      const response = await fetcher({
        url: API_INVOICE_ADD_ROUTE,
        requestBody: {
          ...formData
        }
      });

      if (response.err) {
        toast.error('Failed to update invoice');
        return;
      }

      setIsCreateDialogOpen(false);
      // mutate(endpoint);
      toast.success('Invoice updated successfully');
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
      <h1 className="font-bold text-3xl">Invoices</h1>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        New Invoice
      </Button>

      <InvoiceForm isOpen={isCreateDialogOpen} onSubmit={handleCreateInvoice} onCancel={handleCancel} />
    </div>
  );
}
