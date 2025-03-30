'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/packages/lib/components/card';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import useSWR from 'swr';

type ChartData = {
  month: string;
  revenue: number;
};

export function RevenueChart({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { data, error, isLoading } = useSWR('/api/analytics/revenue/chart', swrFetcher);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (data?.content) {
      setChartData(data.content);
    }
  }, [data]);

  return (
    <Card className={`border-foreground/20 bg-gradient-to-bl from-foreground/4 via-background to-background ${className}`}>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <CardDescription>Monthly revenue from all creative projects</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="h-4 w-4 bg-foreground/20 rounded-full"></div>
              <p className="text-sm text-muted-foreground">Loading revenue data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-red-500">Error loading revenue data</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center flex-col gap-2">
            <p className="text-sm text-muted-foreground">No revenue data available yet</p>
            <p className="text-xs text-muted-foreground">Start tracking payments to see your revenue growth</p>
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 0,
                    fill: '#8b5cf6'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
