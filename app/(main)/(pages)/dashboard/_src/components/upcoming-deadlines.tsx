"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card";
import { Calendar } from "lucide-react";

interface Deadline {
  project: string;
  client: string;
  dueDate: string;
  daysLeft: number;
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  return (
    <Card className="lg:col-span-4 border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
        <CardDescription>Projects due soon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.map((deadline, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{deadline.project}</p>
                <p className="text-sm text-gray-500">{deadline.client}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{deadline.dueDate}</p>
                <p className={`text-sm ${deadline.daysLeft <= 3 ? "text-red-500" : "text-gray-500"}`}>
                  {deadline.daysLeft} days left
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
