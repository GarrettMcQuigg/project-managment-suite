"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/lib/components/card"
import { Badge } from "@/packages/lib/components/badge"
import {
  Archive,
  CheckCircle,
  Clock,
  Paperclip,
  Pause,
  Pencil,
  Trash,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { Progress } from "@/packages/lib/components/progress"
import { Button } from "@/packages/lib/components/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { ProjectWithMetadata } from "@/packages/lib/prisma/types"
import { PhaseStatus, ProjectStatus } from "@prisma/client"
import { PROJECT_DETAILS_ROUTE, routeWithParam } from "@/packages/lib/routes"

interface ActiveProjectsWidgetProps {
  projects: ProjectWithMetadata[]
}

const getProjectStatusBadgeClasses = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.COMPLETED:
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case ProjectStatus.ACTIVE:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case ProjectStatus.PAUSED:
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case ProjectStatus.DRAFT:
    case ProjectStatus.PREPARATION:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    case ProjectStatus.ARCHIVED:
    case ProjectStatus.DELETED:
      return "bg-red-100 text-red-800 hover:bg-red-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

const getProjectStatusIcon = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.COMPLETED:
      return <CheckCircle className="h-3 w-3 mr-1" />
    case ProjectStatus.ACTIVE:
      return <Clock className="h-3 w-3 mr-1" />
    case ProjectStatus.PAUSED:
      return <Pause className="h-3 w-3 mr-1" />
    case ProjectStatus.DRAFT:
      return <Paperclip className="h-3 w-3 mr-1" />
    case ProjectStatus.PREPARATION:
      return <Pencil className="h-3 w-3 mr-1" />
    case ProjectStatus.ARCHIVED:
      return <Archive className="h-3 w-3 mr-1" />
    case ProjectStatus.DELETED:
      return <Trash className="h-3 w-3 mr-1" />
    default:
      return null
  }
}

export function ActiveProjectsWidget({ projects }: ActiveProjectsWidgetProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 3

  const handleViewDetails = (project: ProjectWithMetadata) => {
    router.push(routeWithParam(PROJECT_DETAILS_ROUTE, { id: project.id }))
  }

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (!a.endDate) return 1
      if (!b.endDate) return -1
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    })
  }, [projects])

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedProjects.slice(startIndex, startIndex + pageSize)
  }, [sortedProjects, currentPage, pageSize])

  const totalPages = Math.ceil(sortedProjects.length / pageSize)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <Card className="lg:col-span-8 border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
      <div className="flex justify-between px-6 pt-3 pb-3">
        <div>
          <CardTitle className="text-xl font-semibold">Active Projects</CardTitle>
          <div className="text-muted-foreground text-sm ">
            Current project progress
          </div>
        </div>
        <div className="flex space-x-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center text-primary hover:text-primary/80 bg-transparent hover:bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {paginatedProjects.map((project) => {
              const phases = project.phases || []
              const completedCount = phases.filter((phase) => phase.status === PhaseStatus.COMPLETED).length
              const progressPercentage = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0
  
              return (
                <Card
                  key={project.id}
                  className="relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md cursor-pointer p-4"
                  onClick={() => handleViewDetails(project)}
                >
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold p-0">{project.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{project.client.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`capitalize ${getProjectStatusBadgeClasses(project.status)} bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200`}>
                          {getProjectStatusIcon(project.status)}
                          {project.status.toLowerCase()}
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>
                            End Date: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "No end date"}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <Progress value={progressPercentage} className="h-[6px] mr-4" />
                        <span className="text-xs">{progressPercentage}%</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {completedCount} of {phases.length} phases completed
                      </span>
                      <div className="flex items-center space-x-3">
                        {project.attachments && project.attachments.length > 0 && (
                          <span className="flex items-center">
                            <Paperclip className="h-3 w-3 mr-1" />
                            {project.attachments.length} Attachments
                          </span>
                        )}
                        {project.messages && project.messages.length > 0 && (
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {project.messages.length} Messages
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {paginatedProjects.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">No active projects found</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
