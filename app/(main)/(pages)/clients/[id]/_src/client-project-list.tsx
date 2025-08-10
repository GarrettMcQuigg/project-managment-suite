'use client';

import { Project } from '@prisma/client';
import { Folder, Calendar, Clock, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/packages/lib/components/button';
import { PROJECTS_ROUTE, routeWithPath } from '@/packages/lib/routes';

export function ClientProjectList({ projects }: { projects: Project[] }) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'DRAFT':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const getDaysRemaining = (endDate: Date) => {
    const daysRemaining = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isPastDue = daysRemaining < 0;
    return { daysRemaining: Math.abs(daysRemaining), isPastDue };
  };

  return (
    <div className="relative group">
      <div className="rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <Folder className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Client Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No projects found</p>
            <p className="text-muted-foreground/70 text-sm mt-2">This client doesn't have any projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {projects.map((project) => {
              const { daysRemaining, isPastDue } = getDaysRemaining(new Date(project.endDate));

              return (
                <div key={project.id} className="relative">
                  <div className="border border-border rounded-xl p-6 shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 overflow-hidden">
                    {/* Floating Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Project Header */}
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{project.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{project.description}</p>
                      </div>

                      {/* Timeline with Floating Circle */}
                      <div className="rounded-lg p-4">
                        {/* Horizontal layout for larger screens */}
                        <div className="hidden min-[455px]:flex items-center justify-between relative">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <span className="text-muted-foreground">Start Date:</span>
                              <span className="text-foreground ml-1 font-medium">{format(new Date(project.startDate), 'MMM d')}</span>
                            </div>
                          </div>

                          {/* Floating days remaining circle */}
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div
                              className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center overflow-hidden ${
                                isPastDue
                                  ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                                  : 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span className={`text-xs font-bold ${isPastDue ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>{daysRemaining}</span>
                                <span className={`text-[10px] ${isPastDue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                  {isPastDue ? 'overdue' : 'days left'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <span className="text-muted-foreground">End Date:</span>
                              <span className="text-foreground ml-1 font-medium">{format(new Date(project.endDate), 'MMM d')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Vertical layout for smaller screens */}
                        <div className="flex min-[455px]:hidden flex-col space-y-4">
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <span className="text-muted-foreground">Start Date:</span>
                              <span className="text-foreground ml-1 font-medium">{format(new Date(project.startDate), 'MMM d')}</span>
                            </div>
                          </div>

                          {/* Floating days remaining circle - vertical center */}
                          <div className="flex justify-center">
                            <div
                              className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center overflow-hidden ${
                                isPastDue
                                  ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                                  : 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span className={`text-xs font-bold ${isPastDue ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>{daysRemaining}</span>
                                <span className={`text-[10px] ${isPastDue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                  {isPastDue ? 'overdue' : 'days left'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <span className="text-muted-foreground">End Date:</span>
                              <span className="text-foreground ml-1 font-medium">{format(new Date(project.endDate), 'MMM d')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="pt-2 flex justify-end">
                        <Button asChild className="transition-all duration-300 group/button">
                          <Link href={routeWithPath(PROJECTS_ROUTE, project.id)}>
                            <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover/button:scale-110" />
                            <span>View Details</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
