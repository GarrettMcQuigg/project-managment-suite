import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { unauthorized } from 'next/navigation';
import { ProjectInfo } from './_src/project-info';
import { Breadcrumb } from '@/packages/lib/components/breadcrumb';
import { PROJECTS_ROUTE } from '@/packages/lib/routes';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = getCurrentUser();
  const resolvedParams = await params;

  if (!currentUser) {
    return unauthorized();
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Breadcrumb href={PROJECTS_ROUTE} />
        <h1 className="text-3xl font-bold ">Project Details</h1>
      </div>
      <ProjectInfo projectId={resolvedParams.id} />
    </div>
  );
}
