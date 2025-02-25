'use client';

import { TrashIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { API_INVOICE_DELETE_ROUTE, INVOICES_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/packages/lib/components/confirmation-dialog';
import { DialogTrigger } from '@/packages/lib/components/dialog';

export function DeleteInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetcher({
        url: API_INVOICE_DELETE_ROUTE,
        requestBody: { id: invoiceId },
        method: HttpMethods.DELETE
      });

      if (response.err) {
        toast.error('Failed to delete invoice');
        return;
      }

      toast.success('Invoice deleted successfully');
      router.push(INVOICES_ROUTE);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  return (
    <ConfirmationDialog title="Delete Invoice" description="Are you sure you want to delete this invoice? This action cannot be undone." onConfirm={handleDelete}>
      <DialogTrigger>
        <TrashIcon className="h-5 w-5 cursor-pointer" />
      </DialogTrigger>
    </ConfirmationDialog>
  );
}
