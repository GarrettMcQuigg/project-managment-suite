import { OverviewCards } from './_src/components/analytics/overview-cards';
import { ProjectStats } from './_src/components/analytics/project-stats';
import { ClientEngagement } from './_src/components/client-engagement';
import { RevenueChart } from './_src/components/analytics/revenue-chart';
import SubtleBackground from '@/packages/lib/components/subtle-background';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen-minus-header bg-gradient-to-br from-foreground/5 via-background to-background">
      <SubtleBackground />

      <div className="flex min-h-screen-minus-header">
        <main className="space-y-8 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <div className="space-y-8">
            <OverviewCards />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
              <ProjectStats className="md:col-span-2 lg:col-span-4" />
              <ClientEngagement className="md:col-span-2 lg:col-span-3" />
            </div>
            <RevenueChart className="md:col-span-2 lg:col-span-7" />
          </div>
        </main>
      </div>
    </div>
  );
}
