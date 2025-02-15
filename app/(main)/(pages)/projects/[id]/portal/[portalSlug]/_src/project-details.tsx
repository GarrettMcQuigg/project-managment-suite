'use client';

import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_GET_BY_ID_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { Calendar, Clock, Users } from 'lucide-react';

export default function ProjectDetails({ projectId }: { projectId: string }) {
  const endpoint = API_PROJECT_GET_BY_ID_ROUTE + projectId;
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
    <div className="rounded-xl bg-white dark:bg-[#0F1A1C] p-6 shadow-lg">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
          <div className="mt-2 inline-flex items-center rounded-full bg-gray-100 dark:bg-[#1A2729] px-3 py-1">
            <span className="text-sm font-medium text-emerald-600 dark:text-[#00b894]">{project.status}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">Project Details</h3>
            <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">Client Information</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A2729] text-emerald-600 dark:text-[#00b894]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{project.client.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.type}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-100 dark:bg-[#1A2729] p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-[#00b894]" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
                <p className="text-gray-900 dark:text-white">
                  {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-100 dark:bg-[#1A2729] p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-[#00b894]" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Project Duration</p>
                <p className="text-gray-900 dark:text-white">
                  {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
