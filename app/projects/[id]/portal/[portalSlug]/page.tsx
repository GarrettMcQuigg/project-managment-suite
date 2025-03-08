import PortalHeader from './_src/portal-header';
import ProjectTimeline from './_src/project-timeline';
import ProjectMessaging from './_src/project-messaging';
import ProjectDetails from './_src/project-details';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { db } from '@/packages/lib/prisma/client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';

export default async function ProjectPortalPage({ params }: { params: Promise<{ id: string; portalSlug: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const context = await getSessionContext();
  const portalAccessCookie = cookieStore.get(`portal_access_${resolvedParams.portalSlug}`);
  const portalNameCookie = cookieStore.get(`portal_name_${resolvedParams.portalSlug}`);
  const visitorName = portalNameCookie?.value || 'Portal Visitor';

  const project = await db.project.findUnique({
    where: {
      id: resolvedParams.id,
      portalSlug: resolvedParams.portalSlug,
      portalEnabled: true
    },
    include: {
      client: true
    }
  });

  if (!project) {
    return handleUnauthorized();
  }

  const hasPortalAccess = !!portalAccessCookie;

  if (context.type === 'none' && !hasPortalAccess) {
    redirect(`/api/auth/portal/${resolvedParams.portalSlug}?redirect=${encodeURIComponent(`/projects/${resolvedParams.id}/portal/${resolvedParams.portalSlug}`)}`);
  }

  if (context.type === 'user' && !hasPortalAccess) {
    const isOwner = project.userId === context.user.id;

    if (!isOwner) {
      redirect(`/api/auth/portal/${resolvedParams.portalSlug}?redirect=${encodeURIComponent(`/projects/${resolvedParams.id}/portal/${resolvedParams.portalSlug}`)}`);
    }
  }

  if (hasPortalAccess && (context.type !== 'user' || (context.type === 'user' && context.user.id !== project.userId))) {
    try {
      await db.portalView.create({
        data: {
          projectId: project.id,
          name: visitorName
        }
      });
    } catch (error) {
      console.error('Failed to record portal view:', error);
    }
  }

  const isOwner = context.type === 'user' && context.user.id === project.userId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1416] dark:to-[#0B1416] text-gray-900 dark:text-white">
      <PortalHeader projectName={project.name} projectStatus={project.status} isOwner={isOwner} visitorName={visitorName} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <ProjectDetails projectId={resolvedParams.id} />
          <ProjectTimeline projectId={resolvedParams.id} />
          <ProjectMessaging projectId={resolvedParams.id} />
        </div>
      </main>

      {/* Owner badge - only visible to the project owner */}
      {isOwner && (
        <div className="fixed bottom-0 left-0 w-full bg-primary/10 p-3 border-t shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Viewing as project owner</span>
            <a href={`/projects/${resolvedParams.id}`} className="text-sm text-primary hover:underline">
              Back to Project Dashboard
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
