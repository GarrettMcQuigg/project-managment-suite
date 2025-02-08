'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/packages/lib/components/card';
import { Skeleton } from '@/packages/lib/components/skeleton';
import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_GET_BY_ID_ROUTE, API_PROJECT_UPDATE_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { PaymentSchedule, Phase, Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Pencil } from 'lucide-react';
import { DeleteProjectButton } from './delete-project';
import { toast } from 'react-toastify';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import UnifiedProjectWorkflow from '@/app/(main)/_src/project-workflow-dialog';
import { ProjectFormData } from '@/app/(main)/_src/components/project-step';
import { ProjectTimeline } from './project-timeline';

export function ProjectInfo({ projectId }: { projectId: string }) {
  const endpoint = API_PROJECT_GET_BY_ID_ROUTE + projectId;
  const { data, error, isLoading } = useSWR(endpoint, swrFetcher);
  const [project, setProject] = useState<ProjectWithMetadata | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setProject(data.content);
    }

    if (error) {
      console.error('Error fetching project:', error.message);
      redirect(PROJECTS_ROUTE);
    }
  }, [data, error]);

  const handleProjectUpdate = async (formData: ProjectFormData) => {
    try {
      const response = await fetcher({
        url: API_PROJECT_UPDATE_ROUTE,
        requestBody: {
          id: project!.id,
          ...formData
        },
        method: HttpMethods.PUT
      });

      if (response.err) {
        toast.error('Failed to update project');
        return;
      }

      setIsEditDialogOpen(false);
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
              {project && <Pencil className="h-5 w-5 cursor-pointer" onClick={() => setIsEditDialogOpen(true)} />}
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
                  <dd>{project?.client?.name}</dd>
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
              </>
            )}
          </dl>
        </CardContent>
      </Card>
      {project && <ProjectTimeline project={project} />}

      {project && (
        <UnifiedProjectWorkflow
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onComplete={handleProjectUpdate}
          mode="edit"
          defaultValues={{
            project: {
              name: project.name,
              description: project.description,
              type: project.type!,
              status: project.status,
              startDate: new Date(project.startDate),
              endDate: new Date(project.endDate),
              client: {
                id: project.client?.id || '',
                name: project.client?.name || '',
                email: project.client?.email || '',
                phone: project.client?.phone || ''
              }
            },
            phases: project.phases as Phase[],
            payment: project.payment || {
              id: projectId,
              projectId: projectId,
              totalAmount: new Prisma.Decimal(0),
              amountPaid: new Prisma.Decimal(0),
              depositRequired: null,
              depositDueDate: null,
              depositPaidAt: null,
              paymentSchedule: PaymentSchedule.CUSTOM,
              paymentTerms: null,
              notes: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }}
        />
      )}
    </>
  );
}
