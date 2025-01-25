'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/packages/lib/components/card';
import { Skeleton } from '@/packages/lib/components/skeleton';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_GET_BY_ID_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { Client } from '@prisma/client';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export function ProjectInfo({ projectId }: { projectId: string }) {
  const endpoint = API_PROJECT_GET_BY_ID_ROUTE + projectId;
  const { data, error, isLoading } = useSWR(endpoint, swrFetcher);
  const [project, setProject] = useState<ProjectWithMetadata | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (data) {
      setProject(data.content);
      setClient(data.content.client);
    }

    if (error) {
      console.error('Error fetching client:', error.message);
      redirect(PROJECTS_ROUTE);
    }
  }, [data, error]);

  if (error) return redirect(PROJECTS_ROUTE);

  return (
    <Card className="mb-8 space-y-8">
      <CardHeader>
        <CardTitle>{isLoading ? <Skeleton className="h-8 w-48" /> : project?.name}</CardTitle>
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
                <dt className="font-medium text-gray-500">Client</dt>
                <dd>{client?.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Project Type</dt>
                <dd className="capitalize">{project?.type?.toLowerCase()}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-gray-500">Description</dt>
                <dd className="whitespace-pre-wrap">{project?.description}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Status</dt>
                <dd className="capitalize">{project?.status?.toLowerCase()}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Timeline</dt>
                <dd>
                  {new Date(project?.startDate || '').toLocaleDateString()} - {new Date(project?.endDate || '').toLocaleDateString()}
                </dd>
              </div>
            </>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
