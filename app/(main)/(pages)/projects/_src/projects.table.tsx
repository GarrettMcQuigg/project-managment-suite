'use client';

import { DataTable } from '@/packages/lib/components/data-table';
import { fetcher, swrFetcher } from '@/packages/lib/helpers/fetcher';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_ADD_ROUTE, API_PROJECT_LIST_ROUTE, PROJECT_DETAILS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-toastify';
import { ProjectDialog } from '@/app/(main)/_src/project-dialog';
import { AddProjectRequestBody } from '@/app/api/project/add/types';
import { Project } from '@prisma/client';
import { ClientDialog } from '@/app/(main)/_src/client-dialog';
import { AddProjectButton } from './add-project';
import { ClientFormValues } from '@/app/(main)/_src/components/client/types';
import { ProjectFormValues } from '@/app/(main)/_src/components/project/types';

export default function ProjectsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectWithMetadata[]>([]);
  const { data, isLoading } = useSWR(API_PROJECT_LIST_ROUTE, swrFetcher);
  const [step, setStep] = useState<'project' | 'client'>('project');
  const [projectData, setProjectData] = useState<ProjectFormValues | null>(null);

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

  const handleClientSubmit = async (clientData: ClientFormValues) => {
    try {
      const requestBody: AddProjectRequestBody = {
        client: { ...clientData },
        project: { ...projectData! }
      };

      const response = await fetcher({ url: API_PROJECT_ADD_ROUTE, requestBody });
      if (response.err) {
        toast.error('Failed to create project');
        return;
      }

      setIsOpen(false);
      setStep('project');
      revalidate();
      toast.success('Project created successfully');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  const handleProjectNext = (data: ProjectFormValues) => {
    setProjectData(data);
    setStep('client');
  };

  const revalidate = () => {
    mutate(API_PROJECT_LIST_ROUTE);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <DataTable data={projects} columns={columns} searchKey="name" addRow={<AddProjectButton onClick={() => setIsOpen(true)} />} />
      <ProjectDialog open={isOpen && step === 'project'} onOpenChange={setIsOpen} onNext={handleProjectNext} />
      <ClientDialog open={isOpen && step === 'client'} onOpenChange={setIsOpen} onSubmit={handleClientSubmit} onBack={() => setStep('project')} />
    </>
  );
}
