import { getInvoiceList } from '@/packages/lib/helpers/get-invoice-list';
import InvoiceCard from './_src/components/invoice-card';
// import { NewInvoiceButton } from './_src/add-invoice';

export default async function InvoicesPage() {
  const invoices = await getInvoiceList();

  if (!invoices) {
    return (
      <div className="space-y-8 p-8">
        <h1 className="font-bold text-3xl">Invoices</h1>
        <div className="col-span-full text-center">
          <p className="text-lg text-gray-500">No invoices found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-3xl">Invoices</h1>
        {/* <NewInvoiceButton /> */}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="transition-transform hover:scale-[1.02]">
            <InvoiceCard
              invoice={{
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                type: invoice.type,
                amount: Number(invoice.amount),
                status: invoice.status,
                dueDate: invoice.dueDate,
                projectName: invoice.project.name
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
