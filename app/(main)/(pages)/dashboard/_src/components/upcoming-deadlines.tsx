'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/lib/components/card';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { Calendar } from 'lucide-react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PROJECTS_ROUTE, routeWithPath } from '@/packages/lib/routes';

interface UpcomingDeadlinesProps {
  projects: ProjectWithMetadata[];
}

export function UpcomingDeadlines({ projects }: UpcomingDeadlinesProps) {
  const router = useRouter();
  const projectsWithDaysLeft = useMemo(() => {
    return projects
      .map((project) => {
        const today = new Date();
        const endDate = new Date(project.endDate);

        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...project,
          daysRemaining: diffDays,
          formattedEndDate: new Date(project.endDate).toLocaleDateString()
        };
      })
      .filter((project) => project.daysRemaining > 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 3);
  }, [projects]);

  return (
    <Card className="border-border/80 hover:border-border hover:shadow-md transition-all duration-200 group w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
        <CardDescription>Projects requiring attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectsWithDaysLeft.map((project, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg border hover:border-border/80 hover:shadow-md hover:bg-foreground/5 transition-all duration-200 group cursor-pointer"
            onClick={() => router.push(routeWithPath(PROJECTS_ROUTE, project.id))}
          >
            <div className={`hidden sm:flex h-8 w-8 rounded-full flex items-center justify-center sm:mr-2 ${project.daysRemaining <= 5 ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <Calendar className={`h-4 w-4 ${project.daysRemaining <= 5 ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground sm:text-sm text-xs line-clamp-2 break-words">{project.name}</p>
              <p className="text-xs text-gray-500 truncate">{project.client.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-foreground">Due in {project.daysRemaining} days</p>
              <p className="text-xs text-gray-500">{project.formattedEndDate}</p>
            </div>
          </div>
        ))}
        {projectsWithDaysLeft.length === 0 && <p className="text-center text-foreground">No upcoming deadlines 🎉</p>}
      </CardContent>
    </Card>
  );
}
