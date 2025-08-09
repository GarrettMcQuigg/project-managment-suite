'use client';

import { ArrowUpRight, ArrowDownRight, Timer, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/packages/lib/components/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/packages/lib/components/tooltip';
import { API_ANALYTICS_COMMUNICATION_ROUTE } from '@/packages/lib/routes';
import useSWR from 'swr';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { useState } from 'react';

export function ResponseTimeCard() {
  const endpoint = API_ANALYTICS_COMMUNICATION_ROUTE;
  const { data, error } = useSWR(endpoint, swrFetcher, { refreshInterval: 60000 });
  const [responseTimeChange, setResponseTimeChange] = useState<number>(0);

  if (data && !error) {
    const avgResponseTime = data.avgResponseTime || 0;
    const previousAvgResponseTime = data.previousAvgResponseTime || 0;

    if (previousAvgResponseTime > 0 && avgResponseTime > 0) {
      const calculatedChange = data.responseTimeChange || 0;

      if (responseTimeChange !== calculatedChange) {
        setResponseTimeChange(calculatedChange);
      }
    }
  }

  const formattedResponseTime =
    data?.avgResponseTime !== undefined ? (Number.isInteger(data.avgResponseTime) ? `${data.avgResponseTime}` : `${Number(data.avgResponseTime).toFixed(1)}`) : '--';

  const isFasterResponse = responseTimeChange > 0;

  return (
    <Card className="border-border/80 hover:border-border hover:shadow-md transition-all duration-200 group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Timer className="h-5 w-5 text-amber-500" />
            Response Time
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full bg-muted/80 w-6 h-6 flex items-center justify-center cursor-help">
                  <span className="text-xs">?</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Average time (in minutes) it takes you to respond to client messages. Lower times indicate faster responses.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold">{formattedResponseTime}</p>
              <span className="text-sm text-foreground/60">min</span>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className={`flex items-center text-sm ${isFasterResponse ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {responseTimeChange !== 0 ? (
                  <>
                    {isFasterResponse ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                    <span>{`${Math.abs(responseTimeChange)}% ${isFasterResponse ? 'improvement' : 'decrease'}`}</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-1" />
                    <span className="text-muted-foreground">No change</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative h-12 w-12 flex items-center justify-center">
            <div className="relative p-2 rounded-full">
              <div className="absolute inset-0 rounded-full border-2 border-transparent" />
              <div className={`absolute inset-0 rounded-full border-2 border-transparent ${isFasterResponse ? 'border-green-400/50' : 'border-red-400/50'}`} />
              <div
                className={`absolute inset-0 rounded-full border-2 border-transparent border-t-2 ${isFasterResponse ? 'border-t-green-400' : 'border-t-red-400'} animate-spin-slow`}
                style={{ animationDuration: '2s' }}
              />
              <Clock className={`h-7 w-7 ${isFasterResponse ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
