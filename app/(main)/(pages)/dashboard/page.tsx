import { OverviewCards } from './_src/components/analytics/overview-cards';
import { ProjectStats } from './_src/components/analytics/project-stats';
// import { ClientEngagement } from './_src/components/client-engagement';
import { RevenueChart } from './_src/components/analytics/revenue-chart';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { GetUserAnalytics } from '@/packages/lib/helpers/analytics/get-user-analytics';
import GetTotalClientMessages from '@/packages/lib/helpers/analytics/messages/message-metrics';
import { GetCurrentMonthRevenue } from '@/packages/lib/helpers/analytics/financial/revenue-metrics';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  const userAnalytics = await GetUserAnalytics(currentUser.id);
  const totalMessages = await GetTotalClientMessages(currentUser.id);
  const currentMonthRevenue = await GetCurrentMonthRevenue(currentUser.id);

  console.log('User Analytics:', userAnalytics);

  return (
    <main className="space-y-8 py-8 max-w-7xl mx-auto min-h-screen-minus-header">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-8">
        <OverviewCards userAnalytics={userAnalytics} totalMessages={totalMessages} currentMonthRevenue={currentMonthRevenue} />
        {/* <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7"> */}
        <div className="grid gap-8">
          <div className="md:col-span-2 lg:col-span-4">
            <ProjectStats userAnalytics={userAnalytics} />
          </div>
          {/* <div className="md:col-span-2 lg:col-span-3">
            <ClientEngagement />
          </div> */}
        </div>
        <RevenueChart className="md:col-span-2 lg:col-span-7" />
      </div>
    </main>
  );
}
