'use client';

import React from 'react';
import { Calendar, DollarSign, FileText, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { INVOICE_DETAILS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import { InvoiceType } from '@prisma/client';
import { InvoiceStatus } from '@prisma/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/packages/lib/components/tooltip';

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    type: keyof typeof InvoiceType;
    amount: string;
    status: keyof typeof InvoiceStatus;
    dueDate: Date;
    projectName: string;
  };
}

const statusConfig: Record<InvoiceCardProps['invoice']['status'], { color: string }> = {
  VOID: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
  DRAFT: { color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  SENT: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  PAID: { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
  PAYMENT_FAILED: { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  OVERDUE: { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
  CANCELLED: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' }
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(routeWithParam(INVOICE_DETAILS_ROUTE, { id: invoice.id }));
  };

  return (
    <div className="relative group perspective-1000">
      <div className="relative bg-card dark:bg-card/80 rounded-2xl shadow-lg hover:shadow-2xl shadow-primary/10 group-hover:shadow-primary/40 group-hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-1 group-hover:rotate-[0.5deg] border border-border">
        {/* Floating status badge */}
        <div className="absolute -top-3 -right-3 z-10">
          <div className={`px-4 py-2 rounded-full shadow-lg text-xs font-semibold ${statusConfig[invoice.status].color} backdrop-blur-sm`}>{invoice.status}</div>
        </div>

        <div className="p-8">
          {/* Header with gradient background */}
          <div className="relative -m-8 mb-6 p-8 bg-gradient-to-br from-primary/5 to-secondary/10 dark:from-primary/10 dark:to-secondary/20 rounded-t-2xl backdrop-blur-[1px]">
            <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 break-words">Invoice #{invoice.invoiceNumber}</h3>
            <p className="text-foreground/70 text-sm line-clamp-2 break-words">{invoice.projectName}</p>
            
            {/* Type badge positioned to align with floating circle */}
            <div className="absolute -bottom-6 left-8">
              <span className="flex items-center gap-2 max-w-fit p-3 rounded-xl bg-muted hover:bg-muted/80 hover:text-primary transition-colors cursor-pointer group/type relative shadow-lg">
                <FileText className="w-4 h-4 text-foreground/70" />
                <span className="text-xs">{invoice.type}</span>
              </span>
            </div>

            {/* Floating amount circle */}
            <div className="absolute -bottom-6 right-8">
              <div className="relative w-16 h-16 bg-card dark:bg-card/90 rounded-full shadow-lg dark:shadow-black/30 flex items-center justify-center overflow-hidden group-hover:animate-card-shimmer">
                <span className="flex items-center text-sm font-bold">
                  <DollarSign className="w-4 h-4 mx-auto text-primary mb-1" />
                  <span className="mb-1">{Number(invoice.amount).toFixed(0)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-center justify-between mt-12">
            {/* Timeline */}
            <div className="flex items-center text-sm text-foreground/70">
              <Calendar className="w-4 h-4 mr-2 text-primary/70" />
              <span>
                Due: <b>{new Date(invoice.dueDate).toLocaleDateString()}</b>
              </span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={handleViewDetails}
                      className="p-3 rounded-xl bg-gradient-to-r from-primary to-primary/50 hover:opacity-90 transition-all duration-200 text-primary-foreground shadow-lg hover:shadow-xl cursor-pointer group/details relative"
                    >
                      <Eye className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>View invoice details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
