'use client';

import { DataTable } from '@/packages/lib/components/data-table';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { ClientWithMetadata } from '@/packages/lib/prisma/types';
import { API_CLIENT_LIST_ROUTE, CLIENT_DETAILS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  status: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithMetadata[]>([]);
  const { data, isLoading } = useSWR(API_CLIENT_LIST_ROUTE, swrFetcher);

  useEffect(() => {
    if (data) {
      setClients(data.content);
    }
  }, [data]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'projects',
      label: 'Projects',
      render: (client: Client) => client.projects?.length || 0
    },
    {
      key: 'details',
      label: '',
      render: (client: Client) => (
        <Link href={routeWithParam(CLIENT_DETAILS_ROUTE, { id: client.id })}>
          <div className="text-blue-500">View Details</div>
          {/* <ExternalLink className="h-4 w-4" /> */}
        </Link>
      )
    }
  ];
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">Clients</h1>
      <DataTable data={clients} columns={columns} searchKey="name" />
    </div>
  );
}
