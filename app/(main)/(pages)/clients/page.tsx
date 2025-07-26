import { getClientList } from '@/packages/lib/helpers/get-client-list';
import ClientCard from './_src/client-card';
import { ClientPageHeader } from './_src/client-page-header';

export default async function ClientsPage() {
  const clients = await getClientList();

  if (!clients) {
    return (
      <div className="col-span-full text-center">
        <p className="text-lg text-gray-500">No clients found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen-minus-header">
      <ClientPageHeader />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => (
          <div key={client.id} className="transition-transform hover:scale-[1.02]">
            <ClientCard client={client} />
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full text-center">
            <p className="text-lg text-black dark:text-white">No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
