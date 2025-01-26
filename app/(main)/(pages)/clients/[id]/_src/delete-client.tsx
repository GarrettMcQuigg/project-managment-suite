'use client';

import { TrashIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { API_CLIENT_DELETE_ROUTE, CLIENTS_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/packages/lib/components/confirmation-dialog';
import { DialogTrigger } from '@/packages/lib/components/dialog';

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetcher({
        url: API_CLIENT_DELETE_ROUTE,
        requestBody: { id: clientId },
        method: HttpMethods.DELETE
      });

      if (response.err) {
        toast.error('Failed to delete client');
        return;
      }

      toast.success('Client deleted successfully');
      router.push(CLIENTS_ROUTE);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  return (
    <ConfirmationDialog title="Delete Client Confirmation" description="Are you sure you want to delete this client? This action cannot be undone." onConfirm={handleDelete}>
      <DialogTrigger>
        <TrashIcon className="h-5 w-5 cursor-pointer" />
      </DialogTrigger>
    </ConfirmationDialog>
  );
}
