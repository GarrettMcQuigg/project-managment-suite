'use client';

import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_GET_BY_ID_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { Calendar, Clock, Users, Pencil, Eye, EyeOff, KeyRound } from 'lucide-react';
import { DeleteProjectButton } from './delete-project';
import { Card } from '@/packages/lib/components/card';

interface ProjectDetailsProps {
  projectId: string;
  showInteralControls?: boolean;
  onEditClick?: () => void;
}

export default function ProjectDetails({ projectId, showInteralControls = false, onEditClick }: ProjectDetailsProps) {
  const endpoint = API_PROJECT_GET_BY_ID_ROUTE + projectId;
  const { data, error } = useSWR(endpoint, swrFetcher);
  const [project, setProject] = useState<ProjectWithMetadata | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="bg-white dark:bg-[#0F1A1C] p-6 min-w-full">
      <div className="mb-6 flex items-start justify-between">
        <div className="w-full">
          <div className="md:flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
            {showInteralControls && (
              <div className="flex gap-4">
                <Pencil className="h-5 w-5 cursor-pointer" onClick={onEditClick} />
                <DeleteProjectButton projectId={project.id} />
              </div>
            )}
          </div>
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

          <div className="sm:flex justify-between md:max-w-[86%]">
            <div>
              <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">Client Information</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A2729] text-emerald-600 dark:text-[#00b894]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{project.client.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{project.client.email}</p>
                </div>
              </div>
            </div>
            {showInteralControls && (
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">Portal Password</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A2729] text-emerald-600 dark:text-[#00b894]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div className="relative">
                    <div className="bg-gray-200 dark:bg-[#0A1214] rounded px-3 py-2 pr-10 font-mono min-w-32">
                      {showPassword ? project.portalPassEncryption : <span className="tracking-[0.2em]">••••••••</span>}
                    </div>
                    <div
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
    </Card>
  );
}
