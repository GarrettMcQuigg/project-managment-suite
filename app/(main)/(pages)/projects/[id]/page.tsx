import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { unauthorized } from 'next/navigation';
import { ProjectInfo } from './_src/project-info';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const currentUser = getCurrentUser();
  const resolvedParams = await params;

  if (!currentUser) {
    return unauthorized();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Project Details</h1>
      <ProjectInfo projectId={resolvedParams.id} />
    </div>
  );
}
