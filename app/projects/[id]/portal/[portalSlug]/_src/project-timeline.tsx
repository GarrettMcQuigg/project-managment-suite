'use client';

import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_AUTH_PORTAL_GET_BY_ID_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { Card } from '@/packages/lib/components/card';

export default function ProjectTimeline({ projectId }: { projectId: string }) {
  const endpoint = API_AUTH_PORTAL_GET_BY_ID_ROUTE + projectId;
  const { data, error } = useSWR(endpoint, swrFetcher);
  const [project, setProject] = useState<ProjectWithMetadata | null>(null);

  useEffect(() => {
    if (data) {
      setProject(data.content);
    }

    if (error) {
      console.error('Error fetching project:', error.message);
      redirect(PROJECTS_ROUTE);
    }
  }, [data, error]);

  if (!project) {
    return <div>Project not found or access denied.</div>;
  }

  return (
    <Card className="bg-white dark:bg-[#0F1A1C] p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Project Timeline</h2>
      <div className="space-y-8">
        {project.phases.map((phase, index) => (
          <div key={phase.id} className="relative flex gap-6">
            {/* Timeline line */}
            {index < project.phases.length - 1 && <div className="absolute left-[15px] top-[30px] h-[calc(100%+32px)] w-[2px] bg-gray-200 dark:bg-[#1A2729]" />}

            {/* Status icon */}
            <div className="relative z-10">
              {phase.status === 'COMPLETED' ? (
                <div className="rounded-full bg-gray-100 dark:bg-[#1A2729] p-1">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-[#00b894]" />
                </div>
              ) : phase.status === 'IN_PROGRESS' ? (
                <div className="rounded-full bg-gray-100 dark:bg-[#1A2729] p-1">
                  <Clock className="h-6 w-6 text-emerald-600 dark:text-[#00b894]" />
                </div>
              ) : (
                <div className="rounded-full bg-gray-100 dark:bg-[#1A2729] p-1">
                  <Circle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {/* Phase content */}
            <div className="flex-1">
              <div className="rounded-lg bg-gray-100 dark:bg-[#1A2729] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">{phase.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-sm ${getStatusStyle(phase.status)}`}>{getStatusText(phase.status)}</span>
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
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-600 dark:bg-[#1C3A33] dark:text-[#00b894]';
    case 'IN_PROGRESS':
      return 'bg-emerald-100 text-emerald-600 dark:bg-[#1C3A33] dark:text-[#00b894]';
    case 'PENDING':
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-[#1A2729] dark:text-gray-400';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'Completed';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'PENDING':
    default:
      return 'Pending';
  }
}
