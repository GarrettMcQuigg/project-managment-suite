import React from 'react';
import { Calendar, CheckCircle, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';

export default function ProjectOverview({ project }: { project: ProjectWithMetadata }) {
  const completedCheckpoints = project.checkpoints.filter((c) => c.status === 'COMPLETED').length;
  const totalCheckpoints = project.checkpoints.length;
  const progressPercentage = Math.round((completedCheckpoints / totalCheckpoints) * 100);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      {/* Project Info */}
      <div className="w-full flex justify-between">
        <div className="flex flex-col gap-1 min-[415px]:max-w-[70%] max-w-full">
          <h1 className="text-lg sm:text-2xl font-bold text-card-foreground leading-tight">{project.name}</h1>
          <div className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{project.description}</div>
        </div>

        {/* Quick Stats */}
        <div className="hidden min-[415px]:flex flex-col justify-between text-sm ml-2">
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
            <span className="text-muted-foreground">{progressPercentage > 0 ? `${progressPercentage}%` : '0%'} complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
