import { getInvoiceList } from '@/packages/lib/helpers/get-invoice-list';
import InvoiceCard from './_src/components/invoice-card';
import { InvoiceHeader } from './_src/components/invoice-header';

export default async function InvoicesPage() {
  const invoices = await getInvoiceList();

  if (!invoices) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen">
        <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
        <div className="col-span-full text-center">
          <p className="text-lg text-gray-500">No invoices found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen">
      <InvoiceHeader />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="transition-transform hover:scale-[1.02]">
            <InvoiceCard
              invoice={{
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                type: invoice.type,
                amount: invoice.amount?.toString() || '',
                status: invoice.status,
                dueDate: invoice.dueDate,
                projectName: invoice.project?.name || ''
              }}
            />
          </div>
        ))}

        {invoices.length === 0 && (
          <div className="col-span-full text-center">
            <p className="text-lg text-black dark:text-white">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
}
