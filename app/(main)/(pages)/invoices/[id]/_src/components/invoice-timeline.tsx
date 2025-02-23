import { Card, CardContent, CardHeader, CardTitle } from '@/packages/lib/components/card';
import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';

export function InvoiceTimeline({ invoice }: { invoice: InvoiceWithMetadata }) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Invoice Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
              <span className="font-semibold">Created:</span>
              <span className="ml-2">{new Date(invoice.createdAt).toLocaleString()}</span>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
              <span className="font-semibold">Last Updated:</span>
              <span className="ml-2">{new Date(invoice.updatedAt).toLocaleString()}</span>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
              <span className="font-semibold">Due Date:</span>
              <span className="ml-2">{new Date(invoice.dueDate).toLocaleString()}</span>
            </div>
          </li>
          {/* Add more timeline events as needed */}
        </ul>
      </CardContent>
    </Card>
  );
}
