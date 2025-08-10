import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { ProjectInfo } from './_src/project-info';
import { Breadcrumb } from '@/packages/lib/components/breadcrumb';
import { PROJECTS_ROUTE } from '@/packages/lib/routes';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = getCurrentUser();
  const resolvedParams = await params;

  if (!currentUser) {
    return handleUnauthorized();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen-minus-header">
      <div className="flex items-center gap-4 mb-8">
        <Breadcrumb href={PROJECTS_ROUTE} />
        <h1 className="text-2xl font-bold ">Project Details</h1>
      </div>
      <ProjectInfo projectId={resolvedParams.id} />
    </div>
  );
}
