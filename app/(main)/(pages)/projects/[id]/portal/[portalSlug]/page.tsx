import ProjectTimeline from './_src/project-timeline';
import ProjectMessaging from './_src/project-messaging';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import ProjectDetails from '../../_src/project-details';

export default async function ProjectPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = getCurrentUser();
  const resolvedParams = await params;

  if (!currentUser) {
    return handleUnauthorized();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1416] dark:to-[#0B1416] text-gray-900 dark:text-white">
      <header className="border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0B1416]/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">CreativeSuite Portal</h1>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-[#00b894]" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Client Portal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <ProjectDetails projectId={resolvedParams.id} />
          <ProjectTimeline projectId={resolvedParams.id} />
          <ProjectMessaging projectId={resolvedParams.id} />
        </div>
      </main>
    </div>
  );
}
