'use client';

import { ArrowUpRight, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/packages/lib/components/card';
import { Project } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { PROJECTS_ROUTE } from '@/packages/lib/routes';

interface ActiveProjectsCardProps {
  projects: Project[];
}

export function ActiveProjectsCard({ projects }: ActiveProjectsCardProps) {
  const router = useRouter();
  const activeProjects = projects.filter((project) => project.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Projects created more than a week ago
  const newProjects = projects.filter((project) => project.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Projects created in the last week

  return (
    <Card
      className="border-border/40 hover:border-border/80 hover:shadow-lg dark:border-border/80 dark:hover:border-border/80 dark:hover:shadow-lg dark:hover:bg-foreground/5 transition-all duration-200 group cursor-pointer"
      onClick={() => router.push(PROJECTS_ROUTE)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Active Projects</p>
            <p className="text-3xl font-bold mt-1">{activeProjects.length}</p>
            <div className="flex items-center text-sm text-secondary dark:text-secondary mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+{newProjects.length} new this week</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white dark:bg-secondary/30 flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-md scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 dark:via-secondary/20 to-transparent animate-shimmer"></div>
            <FolderOpen className="h-6 w-6 text-secondary dark:text-secondary relative z-10 scale-110 transition-transform duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
