'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/packages/lib/components/card';
import { Skeleton } from '@/packages/lib/components/skeleton';
import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_GET_BY_ID_ROUTE, API_PROJECT_UPDATE_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { Client } from '@prisma/client';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Pencil } from 'lucide-react';
import { ProjectDialog } from '@/app/(main)/_src/project-dialog';
import { ClientDialog } from '@/app/(main)/_src/client-dialog';
import { DeleteProjectButton } from './delete-project';
import { toast } from 'react-toastify';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { ClientFormValues } from '@/app/(main)/_src/components/client/types';
import { ProjectFormValues } from '@/app/(main)/_src/components/project/types';

export function ProjectInfo({ projectId }: { projectId: string }) {
  const endpoint = API_PROJECT_GET_BY_ID_ROUTE + projectId;
  const { data, error, isLoading } = useSWR(endpoint, swrFetcher);
  const [project, setProject] = useState<ProjectWithMetadata | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [step, setStep] = useState<'project' | 'client'>('project');
  const [projectData, setProjectData] = useState<ProjectFormValues | null>(null);

  useEffect(() => {
    if (data) {
      setProject(data.content);
      setClient(data.content.client);
    }

    if (error) {
      console.error('Error fetching project:', error.message);
      redirect(PROJECTS_ROUTE);
    }
  }, [data, error]);

  const handleProjectNext = (data: ProjectFormValues) => {
    setProjectData(data);
    setStep('client');
  };

  const handleClientSubmit = async (clientData: ClientFormValues) => {
    try {
      const requestBody = {
        id: project!.id,
        projectData: projectData,
        client: clientData
      };

      const response = await fetcher({
        url: API_PROJECT_UPDATE_ROUTE,
        requestBody,
        method: HttpMethods.PUT
      });

      if (response.err) {
        toast.error('Failed to update project');
        return;
      }

      setIsEditDialogOpen(false);
      setStep('project');
      mutate(endpoint);
      toast.success('Project updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  if (error) return redirect(PROJECTS_ROUTE);

  return (
    <>
      <Card className="mb-8 space-y-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isLoading ? <Skeleton className="h-8 w-48" /> : project?.name}</CardTitle>
            <div className="flex gap-4">
              <Pencil className="h-5 w-5 cursor-pointer" onClick={() => setIsEditDialogOpen(true)} />
              {project && <DeleteProjectButton projectId={project.id} />}
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

      {project && (
        <>
          <ProjectDialog
            open={isEditDialogOpen && step === 'project'}
            onOpenChange={setIsEditDialogOpen}
            onNext={handleProjectNext}
            mode="edit"
            defaultValues={{
              name: project.name,
              description: project.description,
              type: project.type!,
              status: project.status,
              startDate: new Date(project.startDate),
              endDate: new Date(project.endDate)
            }}
          />
          <ClientDialog
            open={isEditDialogOpen && step === 'client'}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleClientSubmit}
            onBack={() => setStep('project')}
            defaultValues={{
              name: client?.name || '',
              email: client?.email || '',
              phone: client?.phone || ''
            }}
            mode="edit"
          />
        </>
      )}
    </>
  );
}
