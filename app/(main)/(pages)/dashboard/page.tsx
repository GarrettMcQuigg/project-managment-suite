import {
  Calendar,
  AlertCircle,
  CheckCircle,
  Timer,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/packages/lib/components/card"
import { Badge } from "@/packages/lib/components/badge"
import { getCurrentUser } from "@/packages/lib/helpers/get-current-user"
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { getProjectList } from '@/packages/lib/helpers/get-project-list';
import { ActiveProjectsWidget } from "./_src/components/active-projects-widget";
import { ActiveProjectsCard } from "./_src/components/active-projects-card";
import { RevenueCard } from "./_src/components/revenue-card";
import { ProjectStatusChart } from "./_src/components/project-status-chart";
import { ResponseTimeCard } from "./_src/components/response-time-card";
import { TimeTracking } from "./_src/components/time-tracking";
import { MobileActiveProjects } from "./_src/components/mobile-active-projects";
import { CalculateAverageResponseTime } from '@/packages/lib/helpers/analytics/communication/calculate-avg-response-time';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { ProjectStatus } from "@prisma/client";

// Status color mapping for consistent colors across components
export const statusColors: Record<ProjectStatus, string> = {
  'ACTIVE': '#3b82f6', // Blue
  'COMPLETED': '#10b981', // Green
  'PAUSED': '#f59e0b', // Amber
  'PREPARATION': '#8b5cf6', // Purple
  'DRAFT': '#fffb00', // Yellow
  'ARCHIVED': '#6b7280', // Gray
  'DELETED': '#ef4444', // Red
} as Record<ProjectStatus, string>;

function getProjectStatusData(projects: ProjectWithMetadata[]) {
  const statusCounts: Record<string, number> = {};
  
  projects.forEach(project => {
    const status = project.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    color: statusColors[status as ProjectStatus] || '#6b7280'
  }));
}

const timeTrackingData = [
  { day: "Mon", billable: 6.5, nonBillable: 1.5 },
  { day: "Tue", billable: 7.2, nonBillable: 0.8 },
  { day: "Wed", billable: 5.8, nonBillable: 2.2 },
  { day: "Thu", billable: 8.1, nonBillable: 0.9 },
  { day: "Fri", billable: 6.9, nonBillable: 1.1 },
]

const upcomingDeadlines = [
  { project: "TechCorp Brand Identity", client: "TechCorp Inc.", dueDate: "Jan 15", daysLeft: 3 },
  { project: "Logo Package", client: "Local Business", dueDate: "Jan 20", daysLeft: 8 },
  { project: "Marketing Campaign", client: "E-commerce Co.", dueDate: "Jan 25", daysLeft: 13 },
]

const recentInvoices = [
  { number: "INV-2024-001", client: "TechCorp Inc.", amount: 5500, status: "Paid", date: "Jan 10" },
  { number: "INV-2024-002", client: "StartupXYZ", amount: 3200, status: "Overdue", date: "Jan 5" },
  { number: "INV-2024-003", client: "Local Business", amount: 1800, status: "Sent", date: "Jan 12" },
]

async function getResponseTimeMetrics(userId: string) {
  try {
    if (userId) {
      try {
        await CalculateAverageResponseTime(userId);
      } catch (updateError) {
        console.error('Error updating response metrics:', updateError);
      }
    }
  } catch (error) {
    console.error('Error fetching response time metrics:', error);
  }
}

export default async function Dashboard() {
  const currentUser = await getCurrentUser();
  const projects = await getProjectList();
  
  if (!currentUser) {
    return handleUnauthorized();
  }
  
  await getResponseTimeMetrics(currentUser.id);
  const monthlyRevenue = 0;
  const revenueChange = 0;
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        </div>

        <div className="sm:flex sm:space-y-0 space-y-6 gap-6">
          <span className="md:block hidden w-full"><ActiveProjectsWidget projects={projects || []} statusColors={statusColors} /></span>
          <span className="md:hidden block min-w-[45%]">
            <MobileActiveProjects projects={projects || []} statusColors={statusColors} />
          </span>

          <div className="flex flex-col gap-6 min-w-[45%] md:min-w-max">
            <RevenueCard monthlyRevenue={monthlyRevenue} revenueChange={revenueChange} />
            <ActiveProjectsCard projects={projects || []} />
            <ResponseTimeCard />
          </div>
        </div>

        <div className="grid md:gap-6 lg:grid-cols-12">
          <ProjectStatusChart projectStatusData={getProjectStatusData(projects || [])} />
          <TimeTracking timeTrackingData={timeTrackingData} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
              <CardDescription>Projects requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      deadline.daysLeft <= 5 ? "bg-red-100" : "bg-yellow-100"
                    }`}
                  >
                    <Calendar className={`h-4 w-4 ${deadline.daysLeft <= 5 ? "text-red-600" : "text-yellow-600"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{deadline.project}</p>
                    <p className="text-xs text-gray-500">{deadline.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">{deadline.daysLeft} days</p>
                    <p className="text-xs text-gray-500">{deadline.dueDate}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
              <CardDescription>Latest billing activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentInvoices.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        invoice.status === "Paid"
                          ? "bg-green-100"
                          : invoice.status === "Overdue"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                      }`}
                    >
                      {invoice.status === "Paid" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : invoice.status === "Overdue" ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Timer className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{invoice.number}</p>
                      <p className="text-xs text-gray-500">{invoice.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">${invoice.amount.toLocaleString()}</p>
                    <Badge
                      variant={
                        invoice.status === "Paid" ? "default" : invoice.status === "Overdue" ? "destructive" : "outline"
                      }
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
