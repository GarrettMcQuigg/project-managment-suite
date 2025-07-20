"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card"
import { Badge } from "@/packages/lib/components/badge"
import { Progress } from "@/packages/lib/components/progress"
import { ProjectWithMetadata } from "@/packages/lib/prisma/types"
import { PhaseStatus, ProjectStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { PROJECT_DETAILS_ROUTE, routeWithParam } from "@/packages/lib/routes"

interface MobileActiveProjectsProps {
    projects: ProjectWithMetadata[]
}

export function MobileActiveProjects({ projects }: MobileActiveProjectsProps) {
    const router = useRouter()
    
    const sortedProjects = [...projects]
      .sort((a, b) => {
        if (!a.endDate) return 1
        if (!b.endDate) return -1
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      })
      .slice(0, 3)
    
    const handleViewDetails = (projectId: string) => {
      router.push(routeWithParam(PROJECT_DETAILS_ROUTE, { id: projectId }))
    }
    
    return (
        <Card className="border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group md:hidden">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
              <CardDescription>Current project progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedProjects.map((project) => {
                const phases = project.phases || []
                const completedCount = phases.filter(phase => phase.status === PhaseStatus.COMPLETED).length
                const progressPercentage = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0
                
                return (
                  <div 
                    key={project.id} 
                    className="space-y-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/20 p-2 rounded-md transition-colors"
                    onClick={() => handleViewDetails(project.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-xs space-y-1">
                        <h4 className="font-medium dark:text-foreground text-gray-900">{project.name}</h4>
                        <p className="text-muted-foreground">{project.client?.name || "No client"}</p>
                      </div>
                      <Badge variant={project.status === ProjectStatus.ACTIVE ? "default" : "secondary"} className="text-xs">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{completedCount} of {phases.length} phases</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-1.5" />
                    </div>
                  </div>
                )
              })}
              
              {sortedProjects.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">No active projects found</div>
              )}
            </CardContent>
          </Card>
    )
}