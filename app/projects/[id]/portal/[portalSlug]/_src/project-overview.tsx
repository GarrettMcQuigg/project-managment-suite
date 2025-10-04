import React from 'react';
import { Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';

export default function ProjectOverview({ project }: { project: ProjectWithMetadata }) {
  const completedCheckpoints = project.checkpoints.filter((c) => c.status === 'COMPLETED').length;
  const totalCheckpoints = project.checkpoints.length;
  // const progressPercentage = Math.round((completedCheckpoints / totalCheckpoints) * 100);

  // const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  // const isPastDue = daysRemaining < 0;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      {/* Project Info */}
      <div className="w-full flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-2xl font-bold text-card-foreground leading-tight mb-2">{project.name}</h1>
          <div className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{project.description}</div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-6 text-sm">
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
          {/* <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{progressPercentage}% complete</span>
          </div> */}
        </div>
      </div>

      {/* Progress Circle */}
      {/* <div className="flex-shrink-0 flex items-center justify-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(128, 128, 128, 0.3)"
              strokeWidth="3"
              strokeDasharray="100, 100"
              className="text-muted"
            />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-card-foreground">{Math.abs(daysRemaining)}</div>
            <div className={`text-xs font-medium ${isPastDue ? 'text-destructive' : 'text-muted-foreground'}`}>{isPastDue ? 'days overdue' : 'days left'}</div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
