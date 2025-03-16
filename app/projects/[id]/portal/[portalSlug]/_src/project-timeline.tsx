'use client';

import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_AUTH_PORTAL_GET_BY_ID_ROUTE, PROJECTS_ROUTE, API_PROJECT_UPDATE_PHASE_STATUS_ROUTE } from '@/packages/lib/routes';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { Card } from '@/packages/lib/components/card';
import { Button } from '@/packages/lib/components/button';
import { Input } from '@/packages/lib/components/input';
import { Phase, PhaseStatus } from '@prisma/client';
import { Progress } from '@/packages/lib/components/progress';
import { toast } from 'react-toastify';

export default function ProjectTimeline({ projectId, isOwner }: { projectId: string; isOwner: boolean }) {
  const endpoint = API_AUTH_PORTAL_GET_BY_ID_ROUTE + projectId;
  const { data, error } = useSWR(endpoint, swrFetcher);
  const [project, setProject] = useState<ProjectWithMetadata | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (data) {
      const projectWithSortedPhases = {
        ...data.content,
        phases: [...data.content.phases].sort((a, b) => a.order - b.order)
      };

      setProject(projectWithSortedPhases);
      updateProgressPercentage(projectWithSortedPhases.phases);
    }

    if (error) {
      console.error('Error fetching project:', error.message);
      redirect(PROJECTS_ROUTE);
    }
  }, [data, error]);

  const updateProgressPercentage = (phases: Phase[]) => {
    if (!phases.length) return;

    const completedCount = phases.filter((phase) => phase.status === PhaseStatus.COMPLETED).length;
    const percentage = Math.round((completedCount / phases.length) * 100);
    setProgressPercentage(percentage);
  };

  const handleOnComplete = async (phaseId: string) => {
    if (!project || isUpdating) return;

    setIsUpdating(true);

    try {
      const currentPhase = project.phases.find((p) => p.id === phaseId);
      if (!currentPhase) {
        toast.error('Phase not found');
        setIsUpdating(false);
        return;
      }

      const newStatus = currentPhase.status === PhaseStatus.COMPLETED ? PhaseStatus.IN_PROGRESS : PhaseStatus.COMPLETED;

      console.log('Updating phase status:', newStatus, project.id, phaseId);

      const response = await fetcher({
        url: API_PROJECT_UPDATE_PHASE_STATUS_ROUTE,
        requestBody: {
          projectId: project.id,
          phaseId: phaseId,
          newStatus
        }
      });

      if (response.err) {
        toast.error('Failed to update phase status');
        setIsUpdating(false);
        return;
      }

      mutate(endpoint);
      toast.success(`Phase ${newStatus === PhaseStatus.COMPLETED ? 'completed' : 'reopened'} successfully`);
    } catch (error) {
      console.error('Error updating phase status:', error);
      toast.error('An error occurred while updating phase status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!project) {
    return <div>Project not found or access denied.</div>;
  }

  return (
    <Card className="bg-white dark:bg-[#0F1A1C] p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Timeline</h2>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
      <div className="space-y-8">
        {project.phases.map((phase, index) => (
          <div key={phase.id} className="relative flex gap-6">
            {index < project.phases.length - 1 && <div className="absolute left-[15px] top-[30px] h-[calc(100%+32px)] w-[2px] bg-gray-200 dark:bg-[#1A2729]" />}

            <div className="relative z-10">
              {phase.status === PhaseStatus.COMPLETED ? (
                <div className="rounded-full bg-gray-100 dark:bg-[#1A2729] p-1">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-[#00b894]" />
                </div>
              ) : phase.status === PhaseStatus.IN_PROGRESS ? (
                <div className="rounded-full bg-gray-100 dark:bg-[#1A2729] p-1">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-[#b8a600]" />
                </div>
              ) : (
                <div className="rounded-full bg-gray-100 dark:bg-[#1A2729] p-1">
                  <Circle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="rounded-lg bg-gray-100 dark:bg-[#1A2729] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{phase.name}</h3>
                    <span className={`rounded-full px-3 py-1 text-sm ${getStatusStyle(phase.status)}`}>{getStatusText(phase.status)}</span>
                  </div>
                  {isOwner && (
                    <Button onClick={() => handleOnComplete(phase.id)} variant="outline" disabled={isUpdating}>
                      {isUpdating ? 'Updating...' : 'Mark Complete'} <Input type="checkbox" checked={phase.status === PhaseStatus.COMPLETED} readOnly />
                    </Button>
                  )}
                </div>
                {phase.description && <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{phase.description}</p>}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(phase.startDate), 'MMM d, yyyy')} - {format(new Date(phase.endDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case PhaseStatus.COMPLETED:
      return 'bg-emerald-100 text-emerald-600 dark:bg-[#1C3A33] dark:text-[#00b894]';
    case PhaseStatus.IN_PROGRESS:
      return 'bg-yellow-100 text-yellow-600 dark:bg-[#3A331C] dark:text-[#b8a600]';
    case PhaseStatus.PENDING:
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-[#1A2729] dark:text-gray-400';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case PhaseStatus.COMPLETED:
      return 'Completed';
    case PhaseStatus.IN_PROGRESS:
      return 'In Progress';
    case PhaseStatus.PENDING:
    default:
      return 'Pending';
  }
}
