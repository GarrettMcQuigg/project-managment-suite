'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/packages/lib/components/card';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { revenue: 10400, month: 'Jan' },
  { revenue: 14000, month: 'Feb' },
  { revenue: 12000, month: 'Mar' },
  { revenue: 18000, month: 'Apr' },
  { revenue: 16000, month: 'May' },
  { revenue: 22000, month: 'Jun' }
];

export function RevenueChart({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={`border-foreground/20 bg-gradient-to-bl from-foreground/4 via-background to-background ${className}`}>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <CardDescription>Monthly revenue from all creative projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
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
      </CardContent>
    </Card>
  );
}
