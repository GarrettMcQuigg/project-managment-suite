'use client';

import { useEffect, useState, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import {
  API_AUTH_PORTAL_GET_BY_ID_ROUTE,
  PROJECTS_ROUTE,
  API_PROJECT_UPDATE_CHECKPOINT_STATUS_ROUTE,
  API_PROJECT_GET_BY_ID_ROUTE,
  PROJECT_PORTAL_CHECKPOINT_ROUTE
} from '@/packages/lib/routes';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock, Circle, Calendar, Target, Zap, ChevronDown, Minimize2, Maximize2, MessageCircle, ExternalLink } from 'lucide-react';
import { Checkpoint, CheckpointStatus } from '@prisma/client';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { routeWithParam } from '@/packages/lib/routes';

interface CheckpointMessage {
  id: string;
  checkpointId?: string;
  text: string;
  sender?: string;
  createdAt: string;
  attachments?: Array<{
    id: string;
    blobUrl: string;
    pathname: string;
    contentType: string;
  }>;
}

interface ProjectTimelineProps {
  projectId: string;
  isOwner: boolean;
  onScrollToCheckpoint?: (scrollFn: (checkpointId: string) => void) => void;
  portalSlug: string;
}

export default function ProjectTimeline({ projectId, isOwner, onScrollToCheckpoint, portalSlug }: ProjectTimelineProps) {
  const endpoint = API_AUTH_PORTAL_GET_BY_ID_ROUTE + projectId;
  const { data, error } = useSWR(endpoint, swrFetcher);
  const [project, setProject] = useState<ProjectWithMetadata | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isGloballyCollapsed, setIsGloballyCollapsed] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const [checkpointMessages, setCheckpointMessages] = useState<{ [key: string]: CheckpointMessage[] }>({});
  const checkpointRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToCheckpoint = (checkpointId: string) => {
    const checkpointRef = checkpointRefs.current[checkpointId];
    if (checkpointRef) {
      setExpandedCards((prev) => new Set([...prev, checkpointId]));

      setTimeout(() => {
        checkpointRef.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (onScrollToCheckpoint) {
      onScrollToCheckpoint(scrollToCheckpoint);
    }
  }, [onScrollToCheckpoint]);

  useEffect(() => {
    if (data) {
      const projectWithSortedCheckpoints = {
        ...data.content,
        checkpoints: [...data.content.checkpoints].sort((a, b) => a.order - b.order)
      };

      setProject(projectWithSortedCheckpoints);
      updateProgressPercentage(projectWithSortedCheckpoints.checkpoints);

      loadCheckpointMessages(projectWithSortedCheckpoints);

      const currentTask = projectWithSortedCheckpoints.checkpoints.find((checkpoint: Checkpoint) => checkpoint.status !== CheckpointStatus.COMPLETED);
      if (currentTask) {
        setCurrentTaskId(currentTask.id);
        setExpandedCards(new Set([currentTask.id]));
      }
    }

    if (error) {
      console.error('Error fetching project:', error.message);
      redirect(PROJECTS_ROUTE);
    }
  }, [data, error]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadCheckpointMessages = (project: any) => {
    const messagesByCheckpoint: { [key: string]: CheckpointMessage[] } = {};

    project.checkpointMessages?.forEach((message: CheckpointMessage) => {
      if (message.checkpointId) {
        if (!messagesByCheckpoint[message.checkpointId]) {
          messagesByCheckpoint[message.checkpointId] = [];
        }
        messagesByCheckpoint[message.checkpointId].push({
          id: message.id,
          text: message.text,
          sender: message.sender,
          createdAt: message.createdAt,
          attachments: message.attachments || []
        });
      }
    });

    Object.keys(messagesByCheckpoint).forEach((checkpointId) => {
      messagesByCheckpoint[checkpointId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    setCheckpointMessages(messagesByCheckpoint);
  };

  const updateProgressPercentage = (checkpoints: Checkpoint[]) => {
    if (!checkpoints.length) return;

    const completedCount = checkpoints.filter((checkpoint) => checkpoint.status === CheckpointStatus.COMPLETED).length;
    const percentage = Math.round((completedCount / checkpoints.length) * 100);
    setProgressPercentage(percentage);
  };

  const toggleCardExpansion = (checkpointId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(checkpointId)) {
        newSet.delete(checkpointId);
      } else {
        newSet.add(checkpointId);
      }
      return newSet;
    });
  };

  const handleToggleCheckpoint = async (checkpointId: string) => {
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

      if (newStatus === CheckpointStatus.COMPLETED) {
        setExpandedCards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(checkpointId);
          return newSet;
        });

        const sortedCheckpoints = [...project.checkpoints].sort((a, b) => a.order - b.order);
        const currentIndex = sortedCheckpoints.findIndex((c) => c.id === checkpointId);
        const nextIncomplete = sortedCheckpoints.slice(currentIndex + 1).find((c) => c.status !== CheckpointStatus.COMPLETED);
        if (nextIncomplete) {
          setCurrentTaskId(nextIncomplete.id);
          setExpandedCards((prev) => new Set([...prev, nextIncomplete.id]));
        }
      } else {
        setCurrentTaskId(checkpointId);
        setExpandedCards((prev) => new Set([...prev, checkpointId]));
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

  const toggleGlobalCollapse = () => {
    setIsGloballyCollapsed((prev) => {
      if (!prev && currentTaskId) {
        // Collapsing: only show current task
        setExpandedCards(new Set([currentTaskId]));
      } else {
        // Expanding: show current task expanded
        setExpandedCards(new Set(currentTaskId ? [currentTaskId] : []));
      }
      return !prev;
    });
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

  const getCheckpointIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-white" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-white" />;
      default:
        return <Circle className="h-4 w-4 text-white" />;
    }
  };

  const getNodeColor = (status: string, isCurrentTask: boolean) => {
    if (status === 'COMPLETED') return 'bg-primary/60';
    if (isCurrentTask) return 'bg-gradient-to-br from-primary via-primary/50 to-indigo-500 shadow-lg shadow-primary/25';
    return 'dark:bg-violet-500/80 bg-violet-400/80';
  };

  return (
    <div className="max-h-full flex flex-col p-4 overflow-y-auto overscroll-contain">
      {/* Header */}
      <div className="space-y-3 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-fit h-fit bg-gradient-to-br from-primary to-indigo-500/80 rounded-xl shadow-lg mt-1">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-md sm:text-lg font-bold text-card-foreground capitalize">{project.name} - Timeline</h2>
              <p className="text-sm text-muted-foreground hidden sm:block">{project.description}</p>
            </div>
          </div>

          <button onClick={toggleGlobalCollapse} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card hover:bg-accent transition-colors border min-w-fit">
            {isGloballyCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            <span className="text-sm font-medium hidden sm:inline">{isGloballyCollapsed ? 'Show All' : 'Current Task'}</span>
          </button>
        </div>

        <div className="sm:flex sm:justify-between sm:items-center sm:gap-3 space-y-3 sm:space-y-0">
          <div className="w-full flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-card border">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="text-xs text-muted-foreground text-center">
              {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-card border">
            <Target className="h-4 w-4 text-primary" />
            <div className="text-xs text-muted-foreground text-center">
              {completedCheckpoints} of {totalCheckpoints} checkpoints
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-card border">
            <CheckCircle className="h-4 w-4 text-primary" />
            <div className="text-xs text-muted-foreground text-center">{progressPercentage.toFixed(0)}% complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-md font-bold bg-gradient-to-r from-primary to-indigo-500/80 bg-clip-text text-transparent">{progressPercentage}%</span>
          </div>
          <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
            <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${progressPercentage}%` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 max-h-[575px] overflow-y-auto overscroll-contain">
        <div className="space-y-6 mt-4 pb-4">
          {project.checkpoints
            .sort((a, b) => a.order - b.order)
            .filter((checkpoint) => !isGloballyCollapsed || checkpoint.id === currentTaskId)
            .map((checkpoint, index) => {
              const isCurrentTask = checkpoint.id === currentTaskId;
              const isExpanded = expandedCards.has(checkpoint.id);
              const isCompleted = checkpoint.status === CheckpointStatus.COMPLETED;
              const messages = checkpointMessages[checkpoint.id] || [];

              return (
                <div
                  key={checkpoint.id}
                  ref={(el) => {
                    checkpointRefs.current[checkpoint.id] = el;
                  }}
                  className="group relative transition-all duration-300 hover:scale-[1.01] mx-3"
                >
                  {/* Timeline Node - Top Left */}
                  <div className="absolute -left-2 -top-3 z-20">
                    <div
                      className={`
                          w-6 h-6 rounded-full shadow-lg
                          transform transition-all duration-300
                          ${getNodeColor(checkpoint.status, isCurrentTask)}
                          ${isCurrentTask ? 'scale-110 shadow-primary/25' : ''}
                        `}
                    >
                      <div className="absolute inset-1 rounded-full flex items-center justify-center">{getCheckpointIcon(checkpoint.status)}</div>
                      {isCurrentTask && <div className="absolute inset-0 w-6 h-6 rounded-full bg-primary/15 animate-ping"></div>}
                    </div>
                  </div>

                  {/* Checkpoint Card */}
                  <div
                    className={`
                      relative border rounded-lg
                      ${
                        isCurrentTask
                          ? 'border-primary/30 bg-gradient-to-br from-card via-primary/10 to-indigo-500/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                          : isCompleted
                            ? 'border-border/50 bg-card/60 opacity-70'
                            : 'border-indigo-500/30 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:bg-gradient-to-r dark:from-card dark:via-violet-500/10 dark:to-indigo-500/5 hover:border-indigo-500/40 hover:from-indigo-50/50 hover:via-blue-50 hover:to-indigo-50/50'
                      }
                    `}
                  >
                    {/* Card Header - Always Visible */}
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => toggleCardExpansion(checkpoint.id)}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`
                            font-bold text-lg truncate
                            ${isCurrentTask ? 'text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-foreground'}
                          `}
                          >
                            {checkpoint.name ? checkpoint.name : `Checkpoint ${index + 1}`}
                          </h3>
                          {isCurrentTask && (
                            <div className="flex items-center gap-1 text-sm text-primary font-medium mt-1">
                              <Zap className="h-3 w-3" />
                              <span>Current Task</span>
                            </div>
                          )}
                          {messages.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>
                                {messages.length} message{messages.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Complete Button - Always Visible */}
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCheckpoint(checkpoint.id);
                            }}
                            disabled={isUpdating}
                            className={`
                              relative py-2 px-2 sm:px-4 rounded-md font-semibold text-sm
                              transform transition-all duration-300
                              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                              shadow-sm hover:shadow-md
                              before:absolute before:inset-0 before:transition-all before:duration-300
                              after:absolute after:inset-0 after:transition-all after:duration-500
                              overflow-hidden group
                              ${
                                checkpoint.status === CheckpointStatus.COMPLETED
                                  ? `
                                    bg-primary/10 border border-primary/30
                                    hover:before:from-white/10 hover:before:via-white/30 hover:before:to-white/10
                                    after:bg-gradient-to-r after:from-primary/0 after:via-primary/50 after:to-primary/0
                                    after:translate-x-[-100%] hover:after:translate-x-[100%]
                                    shadow-primary/25 hover:shadow-primary/40
                                  `
                                  : `
                                    bg-indigo-500/10
                                    hover:from-indigo-50 hover:via-blue-50 hover:to-indigo-50
                                    text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900
                                    hover:border-indigo-300/60 hover:shadow-indigo-200/40
                                    before:bg-gradient-to-r before:from-indigo-400/0 before:via-indigo-400/10 before:to-indigo-400/0
                                    hover:before:from-indigo-400/5 hover:before:via-indigo-400/15 hover:before:to-indigo-400/5
                                    after:bg-gradient-to-r after:from-blue-400/0 after:via-indigo-400/30 after:to-indigo-400/0
                                    after:translate-x-[-100%] hover:after:translate-x-[100%]
                                  `
                              }
                            `}
                          >
                            {isUpdating ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Updating...</span>
                              </div>
                            ) : isCompleted ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">Completed</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Circle className="h-4 w-4" />
                                <span className="hidden sm:inline">Mark Complete</span>
                              </div>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Expand/Collapse Indicator */}
                      <div className="hidden sm:inline ml-2">
                        <div
                          className={`
                          p-1 rounded-full transition-all duration-300
                          ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}
                        `}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    <div
                      className={`
                      transition-all duration-300 overflow-hidden
                      ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
                    `}
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-border/50">
                        <div className="pt-4">
                          {checkpoint.description && (
                            <p
                              className={`
                              leading-relaxed mb-4 text-sm
                              ${isCompleted ? 'text-muted-foreground/80' : 'text-muted-foreground'}
                            `}
                            >
                              {checkpoint.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className={`h-4 w-4 ${isCurrentTask ? 'text-primary' : 'text-indigo-500'}`} />
                              <span className={isCompleted ? 'text-muted-foreground/80' : 'text-muted-foreground'}>
                                {format(new Date(checkpoint.startDate), 'MMM d')} - {format(new Date(checkpoint.endDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className={`h-4 w-4 ${isCurrentTask ? 'text-indigo-500' : 'text-primary'}`} />
                              <span className={isCompleted ? 'text-muted-foreground/80' : 'text-muted-foreground'}>Checkpoint {index + 1}</span>
                            </div>
                          </div>
                        </div>

                        {/* Checkpoint Discussion Link */}
                        <Link
                          href={routeWithParam(PROJECT_PORTAL_CHECKPOINT_ROUTE, { id: projectId, portalSlug: portalSlug, checkpointId: checkpoint.id })}
                          className="block border border-border bg-card p-4 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MessageCircle className="h-5 w-5 text-primary" />
                              <div>
                                <span className="font-medium text-sm block">View Checkpoint Discussion</span>
                                {messages.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
