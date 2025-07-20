"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card";
import { ProjectWithMetadata } from "@/packages/lib/prisma/types";
import { Calendar } from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { routeWithPath } from "@/packages/lib/routes";
import { PROJECTS_ROUTE } from "@/packages/lib/routes";

interface MissedDeadlinesProps {
  projects: ProjectWithMetadata[];
}

export function MissedDeadlines({ projects }: MissedDeadlinesProps) {
  const router = useRouter()
  const projectsWithDaysLeft = useMemo(() => {
    return projects
      .map(project => {
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
      .filter(project => project.daysRemaining < 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 3);
  }, [projects]);

  return (
    <Card className="border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Missed Deadlines</CardTitle>
        <CardDescription>Projects that have passed their deadline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectsWithDaysLeft.map((project, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg border hover:border-border/80 hover:shadow-md hover:bg-foreground/5 transition-all duration-200 group cursor-pointer" onClick={() => router.push(routeWithPath(PROJECTS_ROUTE, project.id))}>
            <div
              className={`hidden sm:flex h-8 w-8 rounded-full flex items-center justify-center sm:mr-2 ${
                project.daysRemaining >= 5 ? "bg-red-100" : "bg-yellow-100"
              }`}
            >
              <Calendar className={`h-4 w-4 ${project.daysRemaining >= 5 ? "text-red-600" : "text-yellow-600"}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground sm:text-sm text-xs">{project.name}</p>
              <p className="text-xs text-gray-500">{project.client.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-foreground">Due {project.daysRemaining * -1} days ago</p>
              <p className="text-xs text-gray-500">{project.formattedEndDate}</p>
            </div>
          </div>
        ))}
        {projectsWithDaysLeft.length === 0 && (
          <p className="text-foreground text-center mt-20">No missed deadlines 🎉</p>
        )}
      </CardContent>
    </Card>
  );
}
