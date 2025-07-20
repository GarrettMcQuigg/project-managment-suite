"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card";

interface ProjectStatusData {
  status: string;
  count: number;
  color: string;
}

interface ProjectStatusChartProps {
  projectStatusData: ProjectStatusData[];
}

export function ProjectStatusChart({ projectStatusData }: ProjectStatusChartProps) {
  return (
    <Card className="lg:col-span-4 border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Project Distribution</CardTitle>
        <CardDescription>Current project status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={projectStatusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={60}>
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {projectStatusData.map((item) => (
            <div key={item.status} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600">{item.status}: {item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
