'use client';

import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';
import { API_INVOICE_GET_BY_ID_ROUTE, API_INVOICE_UPDATE_ROUTE, INVOICES_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-toastify';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { InvoiceTimeline } from './invoice-timeline';
import InvoiceDetails from './invoice-details';
import { InvoiceForm } from '../../../_src/components/invoice-form';

export function InvoiceInfo({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const endpoint = API_INVOICE_GET_BY_ID_ROUTE + invoiceId;
  const { data, error } = useSWR(endpoint, swrFetcher);
  const [invoice, setInvoice] = useState<InvoiceWithMetadata | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setInvoice(data.content);
    }

    if (error) {
      console.error('Error fetching invoice:', error.message);
      router.push(INVOICES_ROUTE);
    }
  }, [data, error, router]);

  const handleInvoiceUpdate = async (formData: Partial<InvoiceWithMetadata>) => {
    try {
      const response = await fetcher({
        url: API_INVOICE_UPDATE_ROUTE,
        requestBody: {
          id: invoice!.id,
          invoiceNumber: formData.invoiceNumber,
          type: formData.type,
          status: formData.status,
          dueDate: formData.dueDate,
          notes: formData.notes,
          paymentMethod: formData.paymentMethod,
          amount: formData.amount
        },
        method: HttpMethods.PUT
      });

      if (response.err) {
        toast.error('Failed to update invoice');
        return;
      }

      setIsEditDialogOpen(false);
      mutate(endpoint);
      toast.success('Invoice updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  return (
    <>
      <InvoiceDetails invoiceId={invoiceId} showEditControls={true} onEditClick={() => setIsEditDialogOpen(true)} />

      {invoice && <InvoiceTimeline invoice={invoice} />}

      {invoice && <InvoiceForm invoice={invoice} isOpen={isEditDialogOpen} onSubmit={handleInvoiceUpdate} onCancel={() => setIsEditDialogOpen(false)} />}
    </>
  );
}
