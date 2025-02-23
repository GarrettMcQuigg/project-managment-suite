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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { EditInvoiceForm } from './edit-invoice';

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
  }, [data, error]);

  const handleInvoiceUpdate = async (formData: Partial<InvoiceWithMetadata>) => {
    try {
      const response = await fetcher({
        url: API_INVOICE_UPDATE_ROUTE,
        requestBody: {
          id: invoice!.id,
          ...formData
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {invoice && <EditInvoiceForm invoice={invoice} onSubmit={handleInvoiceUpdate} onCancel={() => setIsEditDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
