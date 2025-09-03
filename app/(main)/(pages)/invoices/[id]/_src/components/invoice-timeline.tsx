import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';
import { Calendar, Clock, DollarSign, CheckCircle, Zap, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export function InvoiceTimeline({ invoice }: { invoice: InvoiceWithMetadata }) {
  const timelineEvents = [
    {
      id: 1,
      title: 'Invoice Created',
      description: `Invoice #${invoice.invoiceNumber} was created`,
      date: new Date(invoice.createdAt),
      icon: <FileText className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-500/80'
    },
    {
      id: 2,
      title: 'Last Updated',
      description: 'Invoice details were last modified',
      date: new Date(invoice.updatedAt),
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-500/80'
    },
    {
      id: 3,
      title: 'Payment Due',
      description: `Payment of ${invoice.amount ? `$${parseFloat(invoice.amount).toLocaleString()}` : 'N/A'} is due`,
      date: new Date(invoice.dueDate),
      icon: <DollarSign className="h-4 w-4" />,
      color: getDueDateColor(),
      iconBg: getDueDateIconBg()
    }
  ];

  // Add payment event if paid
  if (invoice.stripePaid && invoice.stripePaidAt) {
    timelineEvents.push({
      id: 4,
      title: 'Payment Received',
      description: 'Payment completed via Stripe',
      date: new Date(invoice.stripePaidAt),
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-500/80'
    });
  }

  // Sort events by date
  timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  function getDueDateColor() {
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const isOverdue = dueDate < now;
    const isPaid = invoice.status === 'PAID';

    if (isPaid) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    } else if (isOverdue) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
    } else {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    }
  }

  function getDueDateIconBg() {
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const isOverdue = dueDate < now;
    const isPaid = invoice.status === 'PAID';

    if (isPaid) {
      return 'bg-emerald-500/80';
    } else if (isOverdue) {
      return 'bg-red-500/80';
    } else {
      return 'bg-orange-500/80';
    }
  }

  return (
    <div className="relative group">
      <div className="">
        {/* Status Summary */}
        <div className="mt-8 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-lg border border-primary/20 w-full">
          <div className="flex items-center gap-3">
            {invoice.status === 'PAID' ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : invoice.status === 'OVERDUE' ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Zap className="h-5 w-5 text-primary" />
            )}
            <div>
              <div className="font-semibold text-foreground">Current Status: {invoice.status.replace('_', ' ')}</div>
              <div className="text-sm text-muted-foreground">
                {invoice.status === 'PAID' ? 'This invoice has been fully paid' : invoice.status === 'OVERDUE' ? 'Payment is past due' : 'Awaiting payment from client'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-6"></div>

        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative flex items-start group/item">
              {/* Timeline line */}
              {index !== timelineEvents.length - 1 && (
                <div
                  className="absolute left-[calc(16px-1px)] top-8 w-0.5 bg-border group-hover/item:bg-primary/30 transition-colors duration-300"
                  style={{ height: 'calc(100% + 1.5rem)' }}
                ></div>
              )}

              {/* Event icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${event.iconBg} text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300`}
              >
                {event.icon}
              </div>

              {/* Event content */}
              <div className="ml-6 flex-1">
                <div className="bg-gradient-to-br from-background/50 to-secondary/10 dark:from-background/30 dark:to-secondary/20 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-foreground">{event.title}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${event.color} w-fit`}>{format(event.date, 'MMM d, yyyy')}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{format(event.date, 'h:mm a')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
