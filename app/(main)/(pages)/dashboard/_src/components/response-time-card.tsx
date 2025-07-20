"use client";

import { ArrowUpRight, ArrowDownRight, Timer } from "lucide-react";
import { Card, CardContent } from "@/packages/lib/components/card";

interface ResponseTimeCardProps {
  avgResponseTime: number | undefined;
  responseTimeChange: number | undefined;
}

export function ResponseTimeCard({ avgResponseTime, responseTimeChange }: ResponseTimeCardProps) {
  const isPositiveChange = responseTimeChange && responseTimeChange > 0;
  
  return (
    <Card className="border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Avg Response Time</p>
            <p className="text-2xl font-bold text-foreground/70 mt-1">
              {avgResponseTime ? `${avgResponseTime} min` : "--"}
            </p>
            <div className={`flex items-center text-sm ${isPositiveChange ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"} mt-1`}>
              {responseTimeChange ? (
                <>
                  {isPositiveChange ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {`${Math.abs(responseTimeChange)}% ${isPositiveChange ? "faster" : "slower"} than last month`}
                  </span>
                </>
              ) : (
                <span>No previous data</span>
              )}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-200 dark:bg-amber-600 flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-md scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/30 dark:via-amber-400/30 to-transparent animate-shimmer"></div>
            <Timer className="h-6 w-6 text-amber-600 dark:text-amber-200 relative z-10 scale-110 transition-transform duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
