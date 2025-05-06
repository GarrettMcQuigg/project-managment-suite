'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, FileText, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { INVOICE_DETAILS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import { InvoiceType } from '@prisma/client';
import { InvoiceStatus } from '@prisma/client';

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

const statusColors: Record<InvoiceCardProps['invoice']['status'], string> = {
  VOID: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  DRAFT: 'bg-muted text-muted-foreground',
  SENT: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  PAID: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
  PAYMENT_FAILED: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  OVERDUE: 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200',
  CANCELLED: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(routeWithParam(INVOICE_DETAILS_ROUTE, { id: invoice.id }));
  };

  return (
    <motion.div
      key={invoice.id}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg bg-card shadow-md transition-all duration-300 hover:shadow-lg dark:shadow-lg dark:shadow-primary/5 dark:hover:shadow-primary/10 cursor-default"
    >
      <div className="absolute inset-0 rounded-lg border border-border/50" />

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 transition-colors duration-300 group-hover:from-primary/10 group-hover:to-accent/10 dark:from-primary/10 dark:via-transparent dark:to-accent/10 dark:group-hover:from-primary/15 dark:group-hover:to-accent/15"></div>

      <div className="relative z-10 p-6">
        <h2 className="mb-2 text-2xl font-semibold text-card-foreground">Invoice #{invoice.invoiceNumber}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{invoice.projectName}</p>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[invoice.status]}`}>{invoice.status}</span>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-primary">{Number(invoice.amount).toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{invoice.type}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewDetails}
            className="flex items-center rounded-md border bg-primary dark:bg-transparent border-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors dark:hover:bg-primary/30 hover:bg-primary/90"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </motion.button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/60 via-primary/80 to-accent/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </motion.div>
  );
};

export default InvoiceCard;
