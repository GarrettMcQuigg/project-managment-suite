'use client';

import React from 'react';
import { Calendar, ExternalLink, Eye } from 'lucide-react';
import { PROJECTS_ROUTE, routeWithPath, routeWithParam, PROJECT_PORTAL_ROUTE } from '@/packages/lib/routes';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/packages/lib/components/tooltip';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: 'DRAFT' | 'PREPARATION' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' | 'DELETED';
    startDate: Date;
    endDate: Date;
    portalSlug: string;
    progress: number;
    team: string[];
    priority: 'low' | 'medium' | 'high';
  };
}

const statusConfig = {
  DRAFT: { color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  PREPARATION: { color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  ACTIVE: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  PAUSED: { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  COMPLETED: { color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  ARCHIVED: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
  DELETED: { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' }
};

const FloatingProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="relative group perspective-1000">
      <div className="relative bg-card dark:bg-card/80 rounded-2xl shadow-lg hover:shadow-2xl shadow-primary/10 group-hover:shadow-primary/40 group-hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-1 group-hover:rotate-[0.5deg] border border-border">
        {/* Floating status badge */}
        <div className="absolute -top-3 -right-3 z-10">
          <div className={`px-4 py-2 rounded-full shadow-lg text-xs font-semibold ${statusConfig[project.status].color} backdrop-blur-sm`}>{project.status}</div>
        </div>

        <div className="p-8">
          {/* Header with gradient background */}
          <div className="relative -m-8 mb-6 p-8 bg-gradient-to-br from-primary/5 to-secondary/10 dark:from-primary/10 dark:to-secondary/20 rounded-t-2xl backdrop-blur-[1px]">
            <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 break-words">{project.name}</h3>
            <p className="text-foreground/70 text-sm line-clamp-2 break-words">{project.description}</p>

            {/* Floating progress circle */}
            <div className="absolute -bottom-6 right-8">
              <div className="relative w-12 h-12 bg-card dark:bg-card/90 rounded-full shadow-lg dark:shadow-black/30 flex items-center justify-center overflow-hidden group-hover:animate-card-shimmer">
                <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--secondary)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="currentColor"
                    className="stroke-primary/15"
                    strokeWidth="3"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="currentColor"
                    className="stroke-primary"
                    strokeWidth="3"
                    strokeDasharray={`${project.progress}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">{project.progress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-center justify-between mt-12">
            {/* Timeline */}
            <div className="flex items-center text-sm text-foreground/70">
              <Calendar className="w-4 h-4 mr-2 text-primary/70" />
              <span>
                {project.startDate.toLocaleDateString()} - {project.endDate.toLocaleDateString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Link href={routeWithParam(PROJECT_PORTAL_ROUTE, { id: project.id, portalSlug: project.portalSlug })} className="inline-block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 rounded-xl bg-muted hover:bg-muted/80 hover:text-primary transition-colors cursor-pointer group/portal relative">
                        <ExternalLink className="w-4 h-4 text-foreground/70" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>View client portal</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
              <Link href={routeWithPath(PROJECTS_ROUTE, project.id)} className="inline-block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-primary/50 hover:opacity-90 transition-all duration-200 text-primary-foreground shadow-lg hover:shadow-xl cursor-pointer group/details relative">
                        <Eye className="w-4 h-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>View project details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingProjectCard;
