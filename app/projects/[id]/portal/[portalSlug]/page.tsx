import PortalHeader from './_src/portal-header';
import ProjectTimeline from './_src/project-timeline';
import ProjectMessaging from './_src/project-messaging';
import ProjectDetails from './_src/project-details';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { db } from '@/packages/lib/prisma/client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { PROJECT_DETAILS_ROUTE, API_AUTH_PORTAL_ROUTE, routeWithParam, PROJECT_PORTAL_ROUTE } from '@/packages/lib/routes';

export default async function ProjectPortalPage({ params, searchParams }: { params: Promise<{ id: string; portalSlug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const context = await getSessionContext();
  const portalAccessCookie = cookieStore.get(`portal_access_${resolvedParams.portalSlug}`);
  const portalNameCookie = cookieStore.get(`portal_name_${resolvedParams.portalSlug}`);
  const visitorName = portalNameCookie?.value || 'Portal Visitor';

  const isPreviewMode = resolvedSearchParams.preview === 'true';

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
    const portalAuthRedirect = `${API_AUTH_PORTAL_ROUTE}/${resolvedParams.portalSlug}`;
    const targetRoute = routeWithParam(PROJECT_PORTAL_ROUTE, {
      id: resolvedParams.id,
      portalSlug: resolvedParams.portalSlug
    });

    redirect(`${portalAuthRedirect}?redirect=${encodeURIComponent(targetRoute)}`);
  }

  if (context.type === 'user' && !hasPortalAccess) {
    const isOwner = project.userId === context.user.id;

    if (!isOwner) {
      const portalAuthRedirect = `${API_AUTH_PORTAL_ROUTE}/${resolvedParams.portalSlug}`;
      const targetRoute = routeWithParam(PROJECT_PORTAL_ROUTE, {
        id: resolvedParams.id,
        portalSlug: resolvedParams.portalSlug
      });

      redirect(`${portalAuthRedirect}?redirect=${encodeURIComponent(targetRoute)}`);
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

  const effectiveIsOwner = isOwner && !isPreviewMode;

  return (
    <div className="min-h-screen text-gray-900 dark:text-white">
      <PortalHeader projectStatus={project.status} isOwner={isOwner} visitorName={visitorName} projectId={resolvedParams.id} portalSlug={resolvedParams.portalSlug} />

      <main className={`${effectiveIsOwner ? 'mb-4' : ''} md:container md:mx-auto sm:px-4 lg:w-3/4 py-8`}>
        <div className="grid gap-8">
          <ProjectDetails projectId={resolvedParams.id} />
          <ProjectTimeline projectId={resolvedParams.id} isOwner={effectiveIsOwner} />
          <ProjectMessaging projectId={resolvedParams.id} />
        </div>
      </main>

      {/* Owner badge - only visible in owner mode, not in preview mode */}
      {effectiveIsOwner && (
        <div className="fixed bottom-0 left-0 w-full bg-primary/50 p-3 border-t shadow-md z-50">
          <div className="container mx-auto flex items-center justify-between">
            <span className="text-sm text-black dark:text-white">Viewing as project owner</span>
            <a href={routeWithParam(PROJECT_DETAILS_ROUTE, { id: resolvedParams.id })} className="text-sm text-text-gray-800 dark:text-gray-200 underline">
              Back to Project Details
            </a>
          </div>
        </div>
      )}

      {/* Preview mode indicator - only visible when in preview mode */}
      {isOwner && isPreviewMode && (
        <div className="fixed bottom-0 left-0 w-full bg-red-500/50 p-3 border-t shadow-md z-50">
          <div className="container mx-auto flex items-center justify-between">
            <span className="text-sm">Client view preview mode</span>
            <a href={routeWithParam(PROJECT_DETAILS_ROUTE, { id: resolvedParams.id })} className="text-sm text-text-gray-800 dark:text-gray-200 underline">
              Back to Project Details
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
