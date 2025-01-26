'use client';

import { TrashIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { API_PROJECT_DELETE_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/packages/lib/components/confirmation-dialog';
import { DialogTrigger } from '@/packages/lib/components/dialog';

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetcher({
        url: API_PROJECT_DELETE_ROUTE,
        requestBody: { id: projectId },
        method: HttpMethods.DELETE
      });

      if (response.err) {
        toast.error('Failed to delete project');
        return;
      }

      toast.success('Project deleted successfully');
      router.push(PROJECTS_ROUTE);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  return (
    <ConfirmationDialog title="Delete Project" description="Are you sure you want to delete this project? This action cannot be undone." onConfirm={handleDelete}>
      <DialogTrigger>
        <TrashIcon className="h-5 w-5 cursor-pointer" />
      </DialogTrigger>
    </ConfirmationDialog>
  );
}
