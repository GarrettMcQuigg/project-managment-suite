import React from 'react';
import { Calendar, Target, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';

export default function ProjectOverview({ project }: { project: ProjectWithMetadata }) {
  const completedCheckpoints = project.checkpoints.filter((c) => c.status === 'COMPLETED').length;
  const totalCheckpoints = project.checkpoints.length;
  const progressPercentage = Math.round((completedCheckpoints / totalCheckpoints) * 100);

  const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isPastDue = daysRemaining < 0;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      {/* Project Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-3xl font-bold text-card-foreground leading-tight">{project.name}</h1>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">{project.description}</p>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {completedCheckpoints} of {totalCheckpoints} checkpoints
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{progressPercentage}% complete</span>
          </div>
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="100, 100"
              className="text-muted"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progressPercentage}, 100`}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-card-foreground">{Math.abs(daysRemaining)}</div>
            <div className={`text-sm font-medium ${isPastDue ? 'text-destructive' : 'text-muted-foreground'}`}>{isPastDue ? 'days overdue' : 'days left'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
