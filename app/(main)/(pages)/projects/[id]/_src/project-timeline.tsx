'use client';

import { Card, CardContent } from '@/packages/lib/components/card';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { Phase } from '@prisma/client';
import type React from 'react';

export function ProjectTimeline({ project }: { project: ProjectWithMetadata }) {
  const startDate = new Date(project.phases[0].startDate);
  const endDate = new Date(project.phases[project.phases.length - 1].endDate);
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

  return (
    <>
      <div className="w-full border-b border-foreground/50 mb-4">
        <dt className="font-medium text-gray-500">Timeline</dt>
        <dd className="mb-2">
          {new Date(project?.startDate || '').toLocaleDateString()} - {new Date(project?.endDate || '').toLocaleDateString()}
        </dd>
      </div>
      <div className="overflow-x-auto">
        <div className="pt-4 min-w-full w-fit">
          {project.phases.map((phase: Phase, index: number) => {
            const phaseStart = new Date(phase.startDate);
            const phaseEnd = new Date(phase.endDate);
            const startOffset = ((phaseStart.getTime() - startDate.getTime()) / (1000 * 3600 * 24) / totalDays) * 100;
            const duration = ((phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 3600 * 24) / totalDays) * 100;

            return (
              <Card
                key={index}
                className="mb-4"
                style={{
                  marginLeft: `${startOffset}%`,
                  width: `calc(100px + ${duration}%)`
                }}
              >
                <CardContent className="p-3">
                  <div className="mb-2">
                    <h4 className="text-md font-semibold">{phase.name}</h4>
                    <div className="text-sm text-muted-foreground">{phase.description}</div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
