import { Card, CardContent } from '@/packages/lib/components/card';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { Phase } from '@prisma/client';
import type React from 'react';

export function ProjectTimeline({ project }: { project: ProjectWithMetadata }) {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

  const getMinWidth = (phase: Phase) => {
    const phaseDuration = (new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / (1000 * 3600 * 24);
    return Math.max(200, (phaseDuration / totalDays) * 1000);
  };

  const getStartOffset = (phase: Phase) => {
    const offset = ((new Date(phase.startDate).getTime() - startDate.getTime()) / (1000 * 3600 * 24) / totalDays) * 100;
    return Math.max(0, offset);
  };

  return (
    <>
      <div className="w-full border-b border-foreground/50 mb-4 mt-8">
        <dt className="font-medium text-gray-500">Timeline Preview</dt>
        <dd className="mb-2">
          {new Date(project?.startDate || '').toLocaleDateString()} - {new Date(project?.endDate || '').toLocaleDateString()}
        </dd>
      </div>
      <div className="overflow-x-auto">
        <div className="pt-4 min-w-full w-fit">
          {project.phases.map((phase: Phase, index: number) => {
            const phaseStart = new Date(phase.startDate);
            const phaseEnd = new Date(phase.endDate);
            const startOffset = getStartOffset(phase);
            const duration = ((phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 3600 * 24) / totalDays) * 100;
            const minWidth = getMinWidth(phase);

            return (
              <Card
                key={index}
                className="mb-4"
                style={{
                  marginLeft: `${startOffset}%`,
                  width: `max(${minWidth}px, calc(${duration}% + 200px))`,
                  minWidth: '200px',
                  maxWidth: '100%'
                }}
              >
                <CardContent className="p-3">
                  <div className="mb-2">
                    <h4 className="text-md font-semibold">{phase.name}</h4>
                    <div className="text-sm text-muted-foreground break-words">{phase.description}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
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
