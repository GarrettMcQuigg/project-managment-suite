'use client';

import { DataTable } from '@/packages/lib/components/data-table';
import { fetcher, swrFetcher } from '@/packages/lib/helpers/fetcher';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_ADD_ROUTE, API_PROJECT_LIST_ROUTE, PROJECT_DETAILS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-toastify';
import { Project } from '@prisma/client';
import { AddProjectButton } from './add-project';
import UnifiedProjectWorkflow from '@/app/(main)/_src/project-workflow-dialog';

export default function ProjectsTable() {
  // const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectWithMetadata[]>([]);
  const { data, isLoading } = useSWR(API_PROJECT_LIST_ROUTE, swrFetcher);

  useEffect(() => {
    if (data) {
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
        </Link>
      )
    }
    // {
    //   key: 'payment',
    //   label: 'Payment',
    //   render: (project: Project) => project.payments...
    // },
  ];

  const handleComplete = async (data: any) => {
    console.log('data', data);
    // setLoading(true);
    try {
      const response = await fetcher({
        url: API_PROJECT_ADD_ROUTE,
        requestBody: data
      });

      if (response.err) {
        toast.error('Failed to create project');
        return;
      }

      setIsOpen(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      // setLoading(false);
    }
  };

  const revalidate = () => {
    mutate(API_PROJECT_LIST_ROUTE);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <DataTable data={projects} columns={columns} searchKey="name" addRow={<AddProjectButton onClick={() => setIsOpen(true)} />} />
      <UnifiedProjectWorkflow open={isOpen} onOpenChange={setIsOpen} onComplete={handleComplete} />
    </>
  );
}
