import { ClientInfo } from './_src/client-info';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { unauthorized } from 'next/navigation';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = getCurrentUser();
  const resolvedParams = await params;

  if (!currentUser) {
    return unauthorized();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Client Details</h1>
      <ClientInfo clientId={resolvedParams.id} />
    </div>
  );
}
