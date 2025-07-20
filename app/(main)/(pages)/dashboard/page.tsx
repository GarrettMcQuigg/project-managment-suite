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
import { UpcomingDeadlines } from "./_src/components";
import { MissedDeadlines } from "./_src/components/missed-deadlines";
import { RecentInvoices } from "./_src/components/recent-invoices";

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
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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

        <div className="sm:grid md:space-y-0 space-y-6 md:space-x-3 gap-6 md:gap-3 lg:grid-cols-12">
          <ProjectStatusChart projectStatusData={getProjectStatusData(projects || [])} />
          <TimeTracking timeTrackingData={timeTrackingData} />
        </div>

        <div className="sm:flex md:space-y-0 space-y-6 md:space-x-3 gap-6 md:gap-3 w-full">
          <UpcomingDeadlines projects={projects || []} />
          <MissedDeadlines projects={projects || []} />
          <RecentInvoices invoices={
            projects?.flatMap(project => 
              project.invoices.map(invoice => ({
                ...invoice,
                clientName: project.client.name
              }))
            ) || []
          } />  
        </div>
      </div>
    </div>
  )
}
