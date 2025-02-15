'use client';

import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_GET_BY_ID_ROUTE, API_PROJECT_UPDATE_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { PaymentSchedule, Phase, Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-toastify';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import UnifiedProjectWorkflow from '@/app/(main)/_src/project-workflow-dialog';
import { ProjectFormData } from '@/app/(main)/_src/components/project-step';
import { ProjectTimeline } from './project-timeline';
import ProjectDetails from './project-details';

export function ProjectInfo({ projectId }: { projectId: string }) {
  const endpoint = API_PROJECT_GET_BY_ID_ROUTE + projectId;
  const { data, error } = useSWR(endpoint, swrFetcher);
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
      <ProjectDetails projectId={projectId} showEditControls={true} onEditClick={() => setIsEditDialogOpen(true)} />

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
              depositRequired: new Prisma.Decimal(0),
              depositDueDate: null,
              depositPaidAt: null,
              paymentSchedule: PaymentSchedule.CUSTOM,
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
