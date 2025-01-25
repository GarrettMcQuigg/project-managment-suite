'use client';

import { DataTable } from '@/packages/lib/components/data-table';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_LIST_ROUTE, PROJECT_DETAILS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import { Project } from '@prisma/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithMetadata[]>([]);
  const { data, isLoading } = useSWR(API_PROJECT_LIST_ROUTE, swrFetcher);

  useEffect(() => {
    if (data) {
      console.log('data', data);
      setProjects(data.content);
    }
  }, [data]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'endDate', label: 'End Date' },
    {
      key: 'details',
      label: '',
      render: (project: Project) => (
        <Link href={routeWithParam(PROJECT_DETAILS_ROUTE, { id: project.id })}>
          <div className="text-blue-500">View Details</div>
          {/* <ExternalLink className="h-4 w-4" /> */}
        </Link>
      )
    }
    // {
    //   key: 'payment',
    //   label: 'Payment',
    //   render: (project: Project) => project.payments...
    // },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">Projects</h1>
      <DataTable data={projects} columns={columns} searchKey="name" />
    </div>
  );
}
