'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/packages/lib/components/card';
import { ProjectList } from './project.info';
import { Project } from '@prisma/client';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher, swrFetcher } from '@/packages/lib/helpers/fetcher';
import { API_CLIENT_GET_BY_ID_ROUTE, API_CLIENT_UPDATE_ROUTE, CLIENTS_ROUTE } from '@/packages/lib/routes';
import { Skeleton } from '@/packages/lib/components/skeleton';
import { ClientWithMetadata } from '@/packages/lib/prisma/types';
import { redirect } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { UpdateClientRequestBody } from '@/app/api/client/update/types';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { DeleteClientButton } from './delete-client';
import { clientFormSchema } from '@/app/(main)/(pages)/clients/[id]/_src/types';
import { ClientFormDialog } from './client-form-dialog';

export function ClientInfo({ clientId }: { clientId: string }) {
  const endpoint = API_CLIENT_GET_BY_ID_ROUTE + clientId;
  const { data, error, isLoading } = useSWR(endpoint, swrFetcher);
  const [client, setClient] = useState<ClientWithMetadata | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setClient(data.content);
      setProjects(data.content.projects);
    }

    if (error) {
      console.error('Error fetching client:', error.message);
      redirect(CLIENTS_ROUTE);
    }
  }, [data, error]);

  if (error) return redirect(CLIENTS_ROUTE);

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{isLoading ? <Skeleton className="h-8 w-48" /> : client?.name}</CardTitle>
            <div className="flex gap-4">
              <Pencil className="h-5 w-5 cursor-pointer" onClick={() => setIsEditDialogOpen(true)} />
              {client && <DeleteClientButton clientId={client.id} />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-12">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <dt className="font-medium text-gray-500">
                      <Skeleton className="h-4 w-20" />
                    </dt>
                    <dd>
                      <Skeleton className="h-4 w-32 mt-1" />
                    </dd>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div>
                  <dt className="font-medium text-gray-500">Email</dt>
                  <dd>{client?.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Phone</dt>
                  <dd>{client?.phone}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Status</dt>
                  <dd>{client?.isArchived ? 'Archived' : 'Active'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Created At</dt>
                  <dd>{new Date(client?.createdAt || '').toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Last Updated</dt>
                  <dd>{new Date(client?.updatedAt || '').toLocaleDateString()}</dd>
                </div>
              </>
            )}
          </dl>
          <ProjectList projects={projects} />
        </CardContent>
      </Card>
      <ClientFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        defaultValues={
          client
            ? {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone
              }
            : undefined
        }
        mode="edit"
        endpoint={API_CLIENT_UPDATE_ROUTE}
      />
    </>
  );
}
