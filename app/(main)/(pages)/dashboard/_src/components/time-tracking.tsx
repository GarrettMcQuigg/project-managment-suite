"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface TimeTrackingProps {
    timeTrackingData: {
        day: string;
        billable: number;
        nonBillable: number;
    }[];
}

export function TimeTracking({ timeTrackingData }: TimeTrackingProps) {
    return (
        <Card className="lg:col-span-8 border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Weekly Time Tracking</CardTitle>
              <CardDescription>Billable vs non-billable hours breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={timeTrackingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        `${value} hours`,
                        name === 'billable' ? 'Billable Hours' : 'Non-billable Hours'
                      ]}
                    />
                    <Bar dataKey="billable" fill="hsl(175, 90%, 35%)" radius={[2, 2, 0, 0]} name="billable" />
                    <Bar dataKey="nonBillable" fill="hsl(0, 0%, 60%)" radius={[2, 2, 0, 0]} name="nonBillable" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
    )
}