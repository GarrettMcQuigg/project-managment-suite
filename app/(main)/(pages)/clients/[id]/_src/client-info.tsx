'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/packages/lib/components/card';
import { ProjectList } from './project.info';
import { Project } from '@prisma/client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { API_CLIENT_GET_BY_ID_ROUTE, CLIENTS_ROUTE } from '@/packages/lib/routes';
import { Skeleton } from '@/packages/lib/components/skeleton';
import { ClientWithMetadata } from '@/packages/lib/prisma/types';
import { redirect } from 'next/navigation';

export function ClientInfo({ clientId }: { clientId: string }) {
  const endpoint = API_CLIENT_GET_BY_ID_ROUTE + clientId;
  const { data, error, isLoading } = useSWR(endpoint, swrFetcher);
  const [client, setClient] = useState<ClientWithMetadata | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (data) {
      console.log('data', data);
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{isLoading ? <Skeleton className="h-8 w-48" /> : client?.name}</CardTitle>
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
  );
}
