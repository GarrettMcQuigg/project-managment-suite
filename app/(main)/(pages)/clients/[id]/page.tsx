import { Breadcrumb } from '@/packages/lib/components/breadcrumb';
import { ClientInfo } from './_src/client-info';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { unauthorized } from 'next/navigation';
import { CLIENTS_ROUTE } from '@/packages/lib/routes';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = getCurrentUser();
  const resolvedParams = await params;

  if (!currentUser) {
    return unauthorized();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen-minus-header">
      <div className="flex items-center gap-4 mb-8">
        <Breadcrumb href={CLIENTS_ROUTE} />
        <h1 className="text-3xl font-bold">Client Details</h1>
      </div>
      <ClientInfo clientId={resolvedParams.id} />
    </div>
  );
}
