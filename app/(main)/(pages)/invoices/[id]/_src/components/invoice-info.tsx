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
import { InvoiceForm } from '../../../_src/components/invoice-form';
import { Skeleton } from '@/packages/lib/components/skeleton';
import { Pencil, DollarSign, Calendar, User, Building2, FileText } from 'lucide-react';
import { DeleteInvoiceButton } from './delete-invoice';
import { format } from 'date-fns';

export function InvoiceInfo({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const endpoint = API_INVOICE_GET_BY_ID_ROUTE + invoiceId;
  const { data, error, isLoading } = useSWR(endpoint, swrFetcher);
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

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      case 'SENT':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'DRAFT':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      case 'OVERDUE':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'CANCELLED':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      case 'VOID':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  if (error) {
    router.push(INVOICES_ROUTE);
    return null;
  }

  if (isLoading || !invoice) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-primary/5 via-card to-secondary/10 dark:from-primary/10 dark:via-card/80 dark:to-secondary/20 rounded-xl shadow-lg p-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-6" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <Skeleton className="h-16 w-16 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getDaysUntilDue = () => {
    const daysUntilDue = Math.ceil((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0 && invoice.status !== 'PAID';
    return { daysUntilDue: Math.abs(daysUntilDue), isOverdue };
  };

  const { daysUntilDue, isOverdue } = getDaysUntilDue();

  return (
    <>
      <div className="space-y-16">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative group">
            <div className="relative bg-gradient-to-br from-primary/5 via-card to-secondary/10 dark:from-primary/10 dark:via-card/80 dark:to-secondary/20 rounded-xl shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-all duration-500 overflow-hidden border border-border">
              {/* Floating Status Badge */}
              <div className="absolute z-20">
                <div
                  className={`px-3 py-2 rounded-br-lg shadow-xl text-sm font-semibold backdrop-blur-sm transform transition-transform duration-300 ${getStatusColor(invoice.status)} flex items-center gap-2`}
                >
                  {invoice.status.replace('_', ' ')}
                </div>
              </div>

              {/* Floating Edit Actions */}
              <div className="absolute top-6 right-6 z-10 flex gap-6">
                <div className="cursor-pointer transform hover:scale-110 transition-all duration-300" onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="h-5 w-5 text-primary" />
                </div>
                <div className="cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <DeleteInvoiceButton invoiceId={invoice.id} />
                </div>
              </div>

              <div className="p-4 sm:p-8 mt-4">
                {/* Invoice Title */}
                <h1 className="text-md sm:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Invoice #{invoice.invoiceNumber}</h1>
                <div className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-3xl capitalize mt-2">{invoice.type.toLowerCase()} Invoice</div>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {/* Amount Card */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Amount</h3>
                    <p className="text-sm text-muted-foreground">Invoice Total</p>
                  </div>
                </div>

                {/* Floating amount circle */}
                <div className="flex justify-center">
                  <div className="relative w-24 h-24 bg-card dark:bg-card/90 rounded-full shadow-lg dark:shadow-black/30 flex items-center justify-center overflow-hidden group-hover:animate-card-shimmer">
                    <svg className="w-24 h-24 transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={isOverdue ? '#ef4444' : 'var(--primary)'} />
                          <stop offset="100%" stopColor={isOverdue ? '#dc2626' : 'var(--secondary)'} />
                        </linearGradient>
                      </defs>
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="currentColor"
                        className={isOverdue ? 'stroke-red-500/15' : 'stroke-primary/15'}
                        strokeWidth="3"
                      />
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="currentColor"
                        className={isOverdue ? 'stroke-red-500' : 'stroke-primary'}
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold mb-1 ${isOverdue ? 'text-red-500' : 'text-primary'}`}>
                          {invoice.amount ? `$${Math.round(parseFloat(invoice.amount))}` : '$0'}
                        </span>
                        <span className="text-xs text-muted-foreground">Total Due</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Card */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-400/10 border border-blue-500/20">
                    {invoice.client ? <User className="h-6 w-6 text-blue-600 dark:text-blue-400" /> : <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Client</h3>
                    <p className="text-sm text-muted-foreground">Billing To</p>
                  </div>
                </div>
                <div className="font-medium text-foreground">{invoice.client?.name || 'No Client'}</div>
                {invoice.client?.email && <div className="text-sm text-muted-foreground mt-1 break-all">{invoice.client.email}</div>}
              </div>
            </div>

            {/* Due Date Card */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`p-3 rounded-full border ${isOverdue ? 'bg-gradient-to-r from-red-500/20 to-red-400/10 border-red-500/20' : 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 border-amber-500/20'}`}
                  >
                    <Calendar className={`h-6 w-6 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Due Date</h3>
                    <p className="text-sm text-muted-foreground">Payment Due</p>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-foreground">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}
                  >
                    {isOverdue ? `${daysUntilDue} days overdue` : `${daysUntilDue} days left`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Info Card */}
          {invoice.project && (
            <div className="relative group">
              <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-400/10 border border-purple-500/20">
                    <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Related Project</h3>
                    <p className="text-sm text-muted-foreground">Project Information</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Project Name</div>
                    <div className="font-medium text-foreground">{invoice.project.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium text-foreground">{invoice.project.status.replace('_', ' ')}</div>
                  </div>
                </div>
                {invoice.project.description && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="text-foreground line-clamp-2">{invoice.project.description}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {invoice.notes && (
            <div className="relative group">
              <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-gray-500/20 to-gray-400/10 border border-gray-500/20">
                    <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Notes</h3>
                    <p className="text-sm text-muted-foreground">Additional Information</p>
                  </div>
                </div>
                <div className="text-foreground leading-relaxed">{invoice.notes}</div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="mt-8">
          <InvoiceTimeline invoice={invoice} />
        </div>
      </div>

      {invoice && <InvoiceForm invoice={invoice} isOpen={isEditDialogOpen} onSubmit={handleInvoiceUpdate} onCancel={() => setIsEditDialogOpen(false)} />}
    </>
  );
}
