'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/lib/components/card';
import { Badge } from '@/packages/lib/components/badge';
import { Progress } from '@/packages/lib/components/progress';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { CheckpointStatus, ProjectStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { PROJECT_DETAILS_ROUTE, PROJECT_PORTAL_ROUTE, routeWithParam } from '@/packages/lib/routes';
import Link from 'next/link';

interface MobileActiveProjectsProps {
  projects: ProjectWithMetadata[];
  statusColors?: Record<ProjectStatus, string>;
}

export function MobileActiveProjects({ projects, statusColors }: MobileActiveProjectsProps) {
  const router = useRouter();

  const sortedProjects = [...projects]
    .sort((a, b) => {
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    })
    .slice(0, 3);

  const handleViewDetails = (projectId: string) => {
    router.push(routeWithParam(PROJECT_DETAILS_ROUTE, { id: projectId }));
  };

  return (
    <Card className="border-border/80 hover:border-border hover:shadow-md transition-all duration-200 group md:hidden">
      <CardHeader className="p-3">
        <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
        <CardDescription>Current project progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-3">
        {sortedProjects.map((project) => {
          const checkpoints = project.checkpoints || [];
          const completedCount = checkpoints.filter((checkpoint) => checkpoint.status === CheckpointStatus.COMPLETED).length;
          const progressPercentage = checkpoints.length > 0 ? Math.round((completedCount / checkpoints.length) * 100) : 0;

          return (
            <div
              key={project.id}
              className="space-y-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/20 rounded-md transition-colors border border-border rounded-md p-3"
              onClick={() => handleViewDetails(project.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 text-xs space-y-1">
                  <h4 className="font-medium dark:text-foreground text-gray-900">{project.name}</h4>
                  <p className="text-muted-foreground">{project.client?.name || 'No client'}</p>
                </div>
                <Badge
                  className="text-xs capitalize flex items-center space-x-1 transition-all duration-300 gap-2"
                  style={statusColors ? { backgroundColor: statusColors[project.status], color: project.status === ProjectStatus.DRAFT ? '#000000' : '#ffffff' } : {}}
                  variant={!statusColors && project.status === ProjectStatus.ACTIVE ? 'default' : 'secondary'}
                >
                  <span className="relative w-2 h-2 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 w-full h-full transform -translate-x-full animate-shimmer" />
                  </span>
                  {project.portalEnabled && project.portalSlug && (
                    <Link
                      href={routeWithParam(PROJECT_PORTAL_ROUTE, { id: project.id, portalSlug: project.portalSlug })}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block"
                    >
                      <span className="text-xs">View Portal</span>
                    </Link>
                  )}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {completedCount} of {checkpoints.length} checkpoints
                  </span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
            </div>
          );
        })}

        {sortedProjects.length === 0 && <div className="text-center p-4 text-muted-foreground">No projects created yet</div>}
      </CardContent>
    </Card>
  );
}
