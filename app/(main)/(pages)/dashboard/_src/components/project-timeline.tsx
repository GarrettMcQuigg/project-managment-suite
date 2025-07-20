"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card";

interface TimelineData {
  name: string;
  projects: number;
}

interface ProjectTimelineProps {
  timelineData: TimelineData[];
}

export function ProjectTimeline({ timelineData }: ProjectTimelineProps) {
  return (
    <Card className="lg:col-span-8 border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Project Timeline</CardTitle>
        <CardDescription>Monthly project completion trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="projects" stroke="#8884d8" fillOpacity={1} fill="url(#colorProjects)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
