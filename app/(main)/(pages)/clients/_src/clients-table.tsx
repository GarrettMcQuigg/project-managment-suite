'use client';

import { DataTable } from '@/packages/lib/components/data-table';
import { fetcher, swrFetcher } from '@/packages/lib/helpers/fetcher';
import { ClientWithMetadata } from '@/packages/lib/prisma/types';
import { API_CLIENT_ADD_ROUTE, API_CLIENT_LIST_ROUTE, CLIENT_DETAILS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { ClientDialog } from '@/app/(main)/_src/client-dialog';
import { toast } from 'react-toastify';
import { AddClientRequestBody } from '@/app/api/client/add/types';
import { DialogTriggerButton } from '@/packages/lib/components/dialog';
import { ClientFormValues } from '@/app/(main)/_src/components/client/types';
import { Button } from '@/packages/lib/components/button';

export default function ClientsTable() {
  const [isOpen, setIsOpen] = useState(false);
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
      render: (client: ClientWithMetadata) => client.projects?.length || 0
    },
    {
      key: 'details',
      label: '',
      render: (client: ClientWithMetadata) => (
        <Link href={routeWithParam(CLIENT_DETAILS_ROUTE, { id: client.id })}>
          <div className="text-blue-500">View Details</div>
        </Link>
      )
    }
  ];

  const handleClientSubmit = async (clientData: ClientFormValues) => {
    try {
      const requestBody: AddClientRequestBody = {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone
      };

      const response = await fetcher({ url: API_CLIENT_ADD_ROUTE, requestBody });

      if (response.err) {
        toast.error('Failed to create project');
        return;
      }

      revalidate();
      setIsOpen(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  const revalidate = () => {
    mutate(API_CLIENT_LIST_ROUTE);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <DataTable
        data={clients}
        columns={columns}
        searchKey="name"
        addRow={
          <>
            <Button onClick={() => setIsOpen(true)}>New Client</Button>
            <ClientDialog open={isOpen} onOpenChange={setIsOpen} onSubmit={handleClientSubmit} />
          </>
        }
      />
    </>
  );
}
