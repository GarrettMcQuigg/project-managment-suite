'use client';

import { Button } from '@/packages/lib/components/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';
import { InvoiceForm } from './invoice-form';

export function InvoiceHeader() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateInvoice = (formData: Partial<InvoiceWithMetadata>) => {
    console.log('Creating new invoice:', formData);

    setIsCreateDialogOpen(false);
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
