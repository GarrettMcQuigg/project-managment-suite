import PortalHeader from './_src/portal-header';
import ProjectTimeline from './_src/project-timeline';
import ProjectMessaging, { PortalContext } from './_src/project-messaging';
import { db } from '@/packages/lib/prisma/client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { API_AUTH_PORTAL_ROUTE, routeWithParam, PROJECT_PORTAL_ROUTE, AUTH_SIGNIN_ROUTE, PROJECT_DETAILS_ROUTE } from '@/packages/lib/routes';
import ProjectOverview from './_src/project-overview';
import PortalClientInfo from './_src/portal-client-info';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { getProjectWithMetadataById } from '@/packages/lib/helpers/get-project-by-id';

export default async function ProjectPortalPage({ params, searchParams }: { params: Promise<{ id: string; portalSlug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const context = await getSessionContext();
  const portalAccessCookie = cookieStore.get(`portal_access_${resolvedParams.portalSlug}`);
  const portalNameCookie = cookieStore.get(`portal_name_${resolvedParams.portalSlug}`);
  const visitorName = portalNameCookie?.value || 'Portal Visitor';

  const isPreviewMode = resolvedSearchParams.preview === 'true';

  const project: ProjectWithMetadata | null = await getProjectWithMetadataById(resolvedParams.id);

  if (!project) {
    redirect(AUTH_SIGNIN_ROUTE);
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
    <div className="min-h-screen">
      <div className="min-h-screen">
        <PortalHeader projectStatus={project.status} isOwner={isOwner} />

        <main className="container mx-auto py-6 lg:px-12 px-4 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px] max-h-[1600px]">
            <div className="lg:col-span-8 border border-border lg:rounded-tl-md lg:rounded-bl-md shadow-md flex flex-col">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border p-4 flex-shrink-0">
                <ProjectOverview project={project} />
              </div>

              <div className="flex-1">
                <ProjectTimeline projectId={resolvedParams.id} isOwner={isOwner} />
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col">
              {isOwner && !isPreviewMode && (
                <div className="border-b border-border flex-shrink-0">
                  <PortalClientInfo client={project.client} />
                </div>
              )}

              <div className="flex-1 max-h-min border border-border lg:rounded-br-md shadow-lg overflow-hidden">
                <ProjectMessaging project={project} isOwner={isOwner} context={context as PortalContext} />
              </div>
            </div>
          </div>
        </main>
        {/* Owner badge - only visible in owner mode, not in preview mode */}
        {effectiveIsOwner && (
          <div className="fixed bottom-0 left-0 w-full bg-primary/50 p-3 border-t shadow-md z-50">
            <div className="container mx-auto flex items-center justify-between">
              <span className="text-sm text-black dark:text-white">Viewing as project owner</span>
              <div className="block xs:hidden">
                <a href={routeWithParam(PROJECT_DETAILS_ROUTE, { id: resolvedParams.id })} className="text-sm text-text-gray-800 dark:text-gray-200 underline">
                  Back to Project Details
                </a>
              </div>
              <div className="hidden xs:block">
                <a href={routeWithParam(PROJECT_DETAILS_ROUTE, { id: resolvedParams.id })} className="text-sm text-text-gray-800 dark:text-gray-200 underline">
                  Back
                </a>
              </div>
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
    </div>
  );
}
