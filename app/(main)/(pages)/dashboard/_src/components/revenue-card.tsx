'use client';

import { ArrowUpRight, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/packages/lib/components/card';

interface RevenueCardProps {
  monthlyRevenue: number;
  revenueChange: number;
}

export function RevenueCard({ monthlyRevenue, revenueChange }: RevenueCardProps) {
  return (
    <Card className="border-border/80 hover:border-border hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Monthly Revenue</p>
            <p className="text-3xl font-bold mt-1">${monthlyRevenue.toLocaleString()}</p>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+{revenueChange}% from last month</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-200 dark:bg-green-600/70 flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-md scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/30 dark:via-green-400/30 to-transparent animate-shimmer"></div>
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-200 relative z-10 scale-110 transition-transform duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
