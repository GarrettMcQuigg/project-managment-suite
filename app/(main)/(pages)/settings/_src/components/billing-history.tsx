import { Button } from '@/packages/lib/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/lib/components/card';
import { CalendarIcon, Download } from 'lucide-react';

// This would typically come from your database
function getBillingHistory() {
  // In a real app, you would fetch this from your database
  return [
    {
      id: 'inv_123456',
      date: new Date('2023-01-01'),
      amount: 49.99,
      currency: 'USD',
      status: 'paid'
    },
    {
      id: 'inv_123455',
      date: new Date('2022-12-01'),
      amount: 49.99,
      currency: 'USD',
      status: 'paid'
    },
    {
      id: 'inv_123454',
      date: new Date('2022-11-01'),
      amount: 49.99,
      currency: 'USD',
      status: 'paid'
    }
  ];
}

export function BillingHistory() {
  const invoices = getBillingHistory();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View and download your past invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No billing history available</p>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-4 font-medium">
                <div>Date</div>
                <div>Amount</div>
                <div className="text-right">Invoice</div>
              </div>
              {invoices.map((invoice) => (
                <div key={invoice.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {invoice.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </div>
                  <div className="text-sm font-medium">
                    {invoice.currency} {invoice.amount}
                  </div>
                  <div className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
