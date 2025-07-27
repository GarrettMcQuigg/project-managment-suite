'use client';

import { Pencil, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/packages/lib/components/card';
import { toast } from 'react-toastify';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { INVOICES_ROUTE, API_INVOICE_GET_BY_ID_ROUTE } from '@/packages/lib/routes';
import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';
import { DeleteInvoiceButton } from './delete-invoice';

interface InvoiceDetailsProps {
  invoiceId: string;
  showEditControls?: boolean;
  onEditClick?: () => void;
}

export default function InvoiceDetails({ invoiceId, showEditControls = false, onEditClick }: InvoiceDetailsProps) {
  const router = useRouter();
  const endpoint = API_INVOICE_GET_BY_ID_ROUTE + invoiceId;
  const { data, error, isLoading } = useSWR(endpoint, swrFetcher);
  const [invoice, setInvoice] = useState<InvoiceWithMetadata | null>(null);

  const handleCopyToClipboard = (text: string, message: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  useEffect(() => {
    if (data) {
      setInvoice(data.content);
    }

    if (error) {
      console.error('Error fetching project:', error.message);
      router.push(INVOICES_ROUTE);
    }
  }, [data, error, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !invoice) {
    return <div>Error loading invoice details</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</CardTitle>
        {showEditControls && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onEditClick}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <DeleteInvoiceButton invoiceId={invoiceId} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Project</h3>
            <p>{invoice?.project?.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p>{invoice.status}</p>
          </div>
          <div>
            <h3 className="font-semibold">Type</h3>
            <p>{invoice.type}</p>
          </div>
          <div>
            <h3 className="font-semibold">Amount</h3>
            <p>${Number(invoice.amount).toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-semibold">Due Date</h3>
            <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="font-semibold">Payment Method</h3>
            <p>{invoice.paymentMethod || 'Not specified'}</p>
          </div>
          {invoice.checkpointId && (
            <div>
              <h3 className="font-semibold">Checkpoint</h3>
              <p>{invoice.checkpoint?.name || 'Unknown'}</p>
            </div>
          )}
        </div>
        {invoice.notes && (
          <div className="mt-4">
            <h3 className="font-semibold">Notes</h3>
            <p>{invoice.notes}</p>
          </div>
        )}
        {invoice.stripeCheckoutUrl && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Payment Link</h3>
            <div className="flex items-center space-x-2">
              <a 
                href={invoice.stripeCheckoutUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Payment Link
              </a>
              <button
                onClick={() => handleCopyToClipboard(invoice.stripeCheckoutUrl!, 'Payment link copied to clipboard!')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Copy payment link"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
