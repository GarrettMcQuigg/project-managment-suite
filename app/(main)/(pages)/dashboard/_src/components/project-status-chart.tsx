"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card"

interface ProjectStatusData {
  status: string
  count: number
  color: string
}

interface ProjectStatusChartProps {
  projectStatusData: ProjectStatusData[]
}

export function ProjectStatusChart({ projectStatusData }: ProjectStatusChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handlePieEnter = (_: unknown, index: number) => {
    setActiveIndex(index)
  }

  const handlePieLeave = () => {
    setActiveIndex(null)
  }

  return (
    <Card className="lg:col-span-4 border-border/80 hover:border-border hover:shadow-md transition-all duration-200 group w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Project Distribution</CardTitle>
        <CardDescription>Current project status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart aria-label="Project Status Distribution Pie Chart">
              <Pie
                data={projectStatusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={60}
                innerRadius={30}
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
                paddingAngle={2}
              >
                {projectStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={activeIndex === index ? 3 : 1}
                    style={{
                      filter: activeIndex === index ? "brightness(1.15)" : "none",
                      transition: "all 0.3s ease-out",
                      transform: activeIndex === index ? "scale(1.08)" : "scale(1)",
                      transformOrigin: "center center",
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {projectStatusData.map((item, index) => (
            <div
              key={item.status}
              className="flex items-center cursor-pointer transition-all duration-200"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="w-3 h-3 rounded-full mr-2 transition-all duration-200"
                style={{
                  backgroundColor: item.color,
                  boxShadow: activeIndex === index ? `0 0 8px 2px ${item.color}` : "none",
                }}
              />
              <span
                className={`text-sm text-foreground capitalize transition-all duration-200 ${
                  activeIndex === index ? "font-semibold text-gray-800 dark:text-foreground" : ""
                }`}
              >
                {item.status.toLowerCase()}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
