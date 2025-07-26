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
import { statusColors } from "./_src/utils/status-colors";
import { UpcomingDeadlines } from "./_src/components";
import { MissedDeadlines } from "./_src/components/missed-deadlines";
import { RecentInvoices } from "./_src/components/recent-invoices";

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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      <div className="sm:flex sm:space-y-0 space-y-8 gap-8">
        <span className="md:block hidden w-full"><ActiveProjectsWidget projects={projects || []} statusColors={statusColors} /></span>
        <span className="md:hidden block min-w-[45%]">
          <MobileActiveProjects projects={projects || []} statusColors={statusColors} />
        </span>

        <div className="flex flex-col gap-8 min-w-[45%] md:min-w-max">
          <RevenueCard monthlyRevenue={monthlyRevenue} revenueChange={revenueChange} />
          <ActiveProjectsCard projects={projects || []} />
          <ResponseTimeCard />
        </div>
      </div>

      <div className="sm:grid md:space-y-0 space-y-8 gap-8 md:gap-8 lg:grid-cols-12">
        <ProjectStatusChart projectStatusData={getProjectStatusData(projects || [])} />
        <TimeTracking timeTrackingData={timeTrackingData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:space-y-0 space-y-8 gap-8 w-full">
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
  )
}
