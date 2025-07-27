'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/lib/components/card';
import { Badge } from '@/packages/lib/components/badge';
import { CheckCircle, AlertCircle, Timer } from 'lucide-react';
import { Invoice } from '@prisma/client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { INVOICES_ROUTE, routeWithPath } from '@/packages/lib/routes';

interface InvoiceWithClient extends Invoice {
  clientName: string;
}

interface RecentInvoicesProps {
  invoices: InvoiceWithClient[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const router = useRouter();
  const sortedInvoices = useMemo(() => {
    return invoices
      .map((invoice) => {
        const today = new Date();
        const dueDate = new Date(invoice.dueDate);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...invoice,
          daysRemaining: diffDays,
          formattedDueDate: dueDate.toLocaleDateString()
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [invoices]);

  return (
    <Card className="border-border/80 hover:border-border hover:shadow-md transition-all duration-200 group w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
        <CardDescription>Latest billing activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedInvoices.map((invoice, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg border hover:border-border/80 hover:shadow-md hover:bg-foreground/5 transition-all duration-200 group cursor-pointer"
            onClick={() => router.push(routeWithPath(INVOICES_ROUTE, invoice.id))}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  invoice.status === 'PAID' ? 'bg-green-100' : invoice.status === 'OVERDUE' ? 'bg-red-100' : 'bg-yellow-100'
                }`}
              >
                {invoice.status === 'PAID' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : invoice.status === 'OVERDUE' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Timer className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground sm:text-sm text-xs line-clamp-2 break-words">{invoice.invoiceNumber}</p>
                <p className="text-xs text-gray-500 truncate">{invoice.clientName}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={invoice.status === 'PAID' ? 'default' : invoice.status === 'OVERDUE' ? 'destructive' : 'outline'} className="text-xs">
                {invoice.status}
              </Badge>
              <p className="font-medium text-foreground sm:text-sm text-xs">${invoice.amount}</p>
            </div>
          </div>
        ))}
        {sortedInvoices.length === 0 && <p className="text-foreground text-center">No recent invoices 🎉</p>}
      </CardContent>
    </Card>
  );
}
