'use client';

import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_AUTH_PORTAL_GET_BY_ID_ROUTE, PROJECTS_ROUTE, API_PROJECT_UPDATE_CHECKPOINT_STATUS_ROUTE, API_PROJECT_GET_BY_ID_ROUTE } from '@/packages/lib/routes';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock, Circle, Calendar, Target, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
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
      mutate(API_AUTH_PORTAL_GET_BY_ID_ROUTE + project.id);
      mutate(API_PROJECT_GET_BY_ID_ROUTE + project.id);
      toast.success(`Checkpoint ${newStatus === CheckpointStatus.COMPLETED ? 'completed' : 'reopened'} successfully`);
    } catch (error) {
      console.error('Error updating checkpoint status:', error);
      toast.error('An error occurred while updating checkpoint status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Project not found or access denied.</div>
      </div>
    );
  }

  const completedCheckpoints = project.checkpoints.filter((c) => c.status === CheckpointStatus.COMPLETED).length;
  const totalCheckpoints = project.checkpoints.length;

  return (
    <div className="space-y-8">
      {/* Timeline Header */}
      <div className="relative group">
        <div className="xs:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Project Timeline</h2>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {completedCheckpoints} of {totalCheckpoints} completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{totalCheckpoints} total checkpoints</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm font-medium text-primary">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-muted" />
          </div>
        </div>
      </div>

      {/* Timeline Items */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted"></div>

        <div className="space-y-8">
          {project.checkpoints.map((checkpoint, index) => (
            <div key={checkpoint.id} className="relative group">
              {/* Timeline Node */}
              <div className="absolute z-10 ml-[1px]">
                <div
                  className={`w-8 h-8 rounded-full border-4 border-background shadow-lg transform group-hover:scale-110 transition-all duration-300 ${
                    checkpoint.status === CheckpointStatus.COMPLETED
                      ? 'bg-gradient-to-r from-teal-500 to-teal-400'
                      : checkpoint.status === CheckpointStatus.IN_PROGRESS
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-300'
                  }`}
                >
                  <div className="absolute inset-1 rounded-full flex items-center justify-center">
                    {checkpoint.status === CheckpointStatus.COMPLETED ? (
                      <CheckCircle className="h-3 w-3 text-white" />
                    ) : checkpoint.status === CheckpointStatus.IN_PROGRESS ? (
                      <Clock className="h-3 w-3 text-white" />
                    ) : (
                      <Circle className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>

                {/* Pulse Animation for Active */}
                {checkpoint.status === CheckpointStatus.IN_PROGRESS && <div className="absolute inset-0 w-8 h-8 rounded-full bg-amber-400 opacity-20 animate-ping"></div>}
              </div>

              {/* Checkpoint Card */}
              <div className="ml-12 group-hover:translate-x-1 transition-transform duration-300">
                <div
                  className={`relative bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-1 border-border overflow-hidden ${
                    checkpoint.status === CheckpointStatus.COMPLETED
                      ? 'ring-2 ring-emerald-500/40'
                      : checkpoint.status === CheckpointStatus.IN_PROGRESS
                        ? 'ring-2 ring-amber-500/40'
                        : 'ring-2 ring-indigo-500/40'
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="xs:flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <h3 className="text-xl font-bold text-foreground">{checkpoint.name || 'Untitled Checkpoint'}</h3>
                          {isOwner && (
                            <>
                              {/* Mobile circle button (smaller than sm) */}
                              <div className="block sm:hidden ml-2">
                                <button
                                  onClick={() => handleOnComplete(checkpoint.id)}
                                  disabled={isUpdating}
                                  className={`
                                    relative w-12 h-12 rounded-full flex items-center justify-center
                                    transform hover:scale-110 active:scale-95 transition-all duration-300
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                    shadow-lg hover:shadow-xl
                                    ${
                                      checkpoint.status === CheckpointStatus.COMPLETED
                                        ? `
                                          bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600
                                          hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-500
                                          text-white border-2 border-emerald-300/30
                                          before:absolute before:inset-0 before:rounded-full
                                          before:bg-gradient-to-br before:from-white/20 before:to-transparent
                                          before:transition-opacity before:duration-300
                                          hover:before:opacity-100 before:opacity-0
                                        `
                                        : `
                                          bg-gradient-to-br from-slate-100 via-white to-slate-50
                                          hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50
                                          text-slate-600 hover:text-indigo-700 border-2 border-slate-200/50
                                          hover:border-indigo-300/50 hover:shadow-indigo-200/30
                                          before:absolute before:inset-0 before:rounded-full
                                          before:bg-gradient-to-br before:from-indigo-400/0 before:to-purple-400/0
                                          hover:before:from-indigo-400/10 hover:before:to-purple-400/10
                                          before:transition-all before:duration-300
                                        `
                                    }
                                  `}
                                >
                                  <div className="relative z-10">
                                    {isUpdating ? (
                                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : checkpoint.status === CheckpointStatus.COMPLETED ? (
                                      <CheckCircle className="h-5 w-5 drop-shadow-sm" />
                                    ) : (
                                      <Circle className="h-5 w-5 drop-shadow-sm" />
                                    )}
                                  </div>

                                  {/* Subtle pulse animation for incomplete tasks */}
                                  {checkpoint.status !== CheckpointStatus.COMPLETED && !isUpdating && (
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 animate-pulse opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                  )}
                                </button>
                              </div>

                              {/* Desktop button (sm and larger) */}
                              <div className="hidden sm:block ml-4">
                                <button
                                  onClick={() => handleOnComplete(checkpoint.id)}
                                  disabled={isUpdating}
                                  className={`
                                    relative px-6 py-3 rounded-xl font-semibold text-sm
                                    transform hover:scale-105 active:scale-95 transition-all duration-300
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                    shadow-sm hover:shadow-md
                                    before:absolute before:inset-0 before:rounded-xl before:transition-all before:duration-300
                                    after:absolute after:inset-0 after:rounded-xl after:transition-all after:duration-500
                                    overflow-hidden group
                                    ${
                                      checkpoint.status === CheckpointStatus.COMPLETED
                                        ? `
                                          bg-gradient-to-r from-primary/90 via-primary/80 to-primary/80
                                          hover:from-primary/95 hover:via-primary/90 hover:to-primary/85
                                          text-white border border-primary/30
                                          before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0
                                          hover:before:from-white/10 hover:before:via-white/30 hover:before:to-white/10
                                          after:bg-gradient-to-r after:from-primary/0 after:via-primary/50 after:to-primary/0
                                          after:translate-x-[-100%] hover:after:translate-x-[100%]
                                          shadow-primary/25 hover:shadow-primary/40
                                        `
                                        : `
                                          bg-gradient-to-r from-slate-50 via-white to-slate-50
                                          hover:from-indigo-50 hover:via-blue-50 hover:to-purple-50
                                          text-slate-700 hover:text-indigo-700 border border-slate-200
                                          hover:border-indigo-300/60 hover:shadow-indigo-200/40
                                          before:bg-gradient-to-r before:from-indigo-400/0 before:via-indigo-400/10 before:to-purple-400/0
                                          hover:before:from-indigo-400/5 hover:before:via-indigo-400/15 hover:before:to-purple-400/5
                                          after:bg-gradient-to-r after:from-blue-400/0 after:via-indigo-400/30 after:to-purple-400/0
                                          after:translate-x-[-100%] hover:after:translate-x-[100%]
                                        `
                                    }
                                  `}
                                >
                                  <div className="relative z-10 flex items-center gap-3">
                                    {isUpdating ? (
                                      <div className="flex items-center gap-2 px-[0px]">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span className="tracking-wide">Updating...</span>
                                      </div>
                                    ) : checkpoint.status === CheckpointStatus.COMPLETED ? (
                                      <div className="flex items-center gap-2 px-[0px]">
                                        <CheckCircle className="h-4 w-4 drop-shadow-sm" />
                                        <span className="tracking-wide">Completed</span>
                                        <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 px-[0px]">
                                        <Circle className="h-4 w-4 drop-shadow-sm group-hover:rotate-180 transition-transform duration-500" />
                                        <span className="tracking-wide">Mark Complete</span>
                                        <Zap className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:text-indigo-600 transition-all duration-300" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Shimmer effect */}
                                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        {checkpoint.description && <p className="text-muted-foreground leading-relaxed mb-4">{checkpoint.description}</p>}

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>
                              {format(new Date(checkpoint.startDate), 'MMM d')} - {format(new Date(checkpoint.endDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span>Checkpoint {index + 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
