'use client';

import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_AUTH_PORTAL_GET_BY_ID_ROUTE, PROJECTS_ROUTE, API_PROJECT_UPDATE_CHECKPOINT_STATUS_ROUTE } from '@/packages/lib/routes';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
import { Input } from '@/packages/lib/components/input';
import { Checkpoint, CheckpointStatus } from '@prisma/client';
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
      const projectWithSortedCheckpoints = {
        ...data.content,
        checkpoints: [...data.content.checkpoints].sort((a, b) => a.order - b.order)
      };

      setProject(projectWithSortedCheckpoints);
      updateProgressPercentage(projectWithSortedCheckpoints.checkpoints);
    }

    if (error) {
      console.error('Error fetching project:', error.message);
      redirect(PROJECTS_ROUTE);
    }
  }, [data, error]);

  const updateProgressPercentage = (checkpoints: Checkpoint[]) => {
    if (!checkpoints.length) return;

    const completedCount = checkpoints.filter((checkpoint) => checkpoint.status === CheckpointStatus.COMPLETED).length;
    const percentage = Math.round((completedCount / checkpoints.length) * 100);
    setProgressPercentage(percentage);
  };

  const handleOnComplete = async (checkpointId: string) => {
    if (!project || isUpdating) return;

    setIsUpdating(true);

    try {
      const currentCheckpoint = project.checkpoints.find((c) => c.id === checkpointId);
      if (!currentCheckpoint) {
        toast.error('Checkpoint not found');
        setIsUpdating(false);
        return;
      }

      const newStatus = currentCheckpoint.status === CheckpointStatus.COMPLETED ? CheckpointStatus.IN_PROGRESS : CheckpointStatus.COMPLETED;

      console.log('Updating checkpoint status:', newStatus, project.id, checkpointId);

      const response = await fetcher({
        url: API_PROJECT_UPDATE_CHECKPOINT_STATUS_ROUTE,
        requestBody: {
          projectId: project.id,
          checkpointId: checkpointId,
          newStatus
        }
      });

      if (response.err) {
        toast.error('Failed to update checkpoint status');
        setIsUpdating(false);
        return;
      }

      mutate(endpoint);
      toast.success(`Checkpoint ${newStatus === CheckpointStatus.COMPLETED ? 'completed' : 'reopened'} successfully`);
    } catch (error) {
      console.error('Error updating checkpoint status:', error);
      toast.error('An error occurred while updating checkpoint status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!project) {
    return <div>Project not found or access denied.</div>;
  }

  return (
    <div className="p-6">
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
        {project.checkpoints.map((checkpoint, index) => (
          <div key={checkpoint.id} className="relative flex gap-6">
            {index < project.checkpoints.length - 1 && <div className="absolute left-[15px] top-[30px] h-[calc(100%+32px)] w-[2px] bg-gray-200 dark:bg-[#1A2729]" />}

            <div className="relative z-10">
              {checkpoint.status === CheckpointStatus.COMPLETED ? (
                <div className="rounded-full bg-gray-100 dark:bg-[#1A2729] p-1">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-[#00b894]" />
                </div>
              ) : checkpoint.status === CheckpointStatus.IN_PROGRESS ? (
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
                    <h3 className="font-medium text-gray-900 dark:text-white">{checkpoint.name ? checkpoint.name : 'Untitled'}</h3>
                    <span className={`rounded-full px-3 py-1 text-sm ${getStatusStyle(checkpoint.status)}`}>{getStatusText(checkpoint.status)}</span>
                  </div>
                  {isOwner && (
                    <Button onClick={() => handleOnComplete(checkpoint.id)} variant="outline" disabled={isUpdating}>
                      {isUpdating ? 'Updating...' : 'Mark Complete'} <Input type="checkbox" checked={checkpoint.status === CheckpointStatus.COMPLETED} readOnly />
                    </Button>
                  )}
                </div>
                {checkpoint.description && <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{checkpoint.description}</p>}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(checkpoint.startDate), 'MMM d, yyyy')} - {format(new Date(checkpoint.endDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case CheckpointStatus.COMPLETED:
      return 'bg-emerald-100 text-emerald-600 dark:bg-[#1C3A33] dark:text-[#00b894]';
    case CheckpointStatus.IN_PROGRESS:
      return 'bg-yellow-100 text-yellow-600 dark:bg-[#3A331C] dark:text-[#b8a600]';
    case CheckpointStatus.PENDING:
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-[#1A2729] dark:text-gray-400';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case CheckpointStatus.COMPLETED:
      return 'Completed';
    case CheckpointStatus.IN_PROGRESS:
      return 'In Progress';
    case CheckpointStatus.PENDING:
    default:
      return 'Pending';
  }
}
