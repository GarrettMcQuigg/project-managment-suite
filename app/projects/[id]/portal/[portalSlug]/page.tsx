import PortalHeader from './_src/portal-header';
import ProjectTimeline from './_src/project-timeline';
import ProjectMessaging, { PortalContext } from './_src/project-messaging';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { API_AUTH_PORTAL_ROUTE, routeWithParam, PROJECT_PORTAL_ROUTE, AUTH_SIGNIN_ROUTE, PROJECT_DETAILS_ROUTE } from '@/packages/lib/routes';
import PortalClientInfo from './_src/portal-client-info';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { getProjectForPortalAccess } from '@/packages/lib/helpers/get-project-by-id';
import { validatePortalSessionForProject, getPortalSessionCookieName } from '@/packages/lib/helpers/portal/portal-session';

export default async function ProjectPortalPage({ params, searchParams }: { params: Promise<{ id: string; portalSlug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const context = await getSessionContext();

  const isPreviewMode = resolvedSearchParams.preview === 'true';
  const project: ProjectWithMetadata | null = await getProjectForPortalAccess(resolvedParams.id);

  if (!project) {
    redirect(AUTH_SIGNIN_ROUTE);
  }

  if (project.portalSlug !== resolvedParams.portalSlug) {
    redirect(AUTH_SIGNIN_ROUTE);
  }

  const isOwner = context.type === 'user' && context.user.id === project.userId;

  let portalSession = null;

  const sessionCookieName = getPortalSessionCookieName(resolvedParams.id);
  const sessionCookie = cookieStore.get(sessionCookieName);

  if (sessionCookie?.value) {
    portalSession = await validatePortalSessionForProject(sessionCookie.value, resolvedParams.id);
  }

  const hasPortalAccess = !!portalSession;

  if (isOwner) {
    // Owner has access
  } else if (context.type === 'none' && !hasPortalAccess) {
    const portalAuthRedirect = `${API_AUTH_PORTAL_ROUTE}/${resolvedParams.portalSlug}`;
    const targetRoute = routeWithParam(PROJECT_PORTAL_ROUTE, {
      id: resolvedParams.id,
      portalSlug: resolvedParams.portalSlug
    });

    redirect(`${portalAuthRedirect}?redirect=${encodeURIComponent(targetRoute)}`);
  } else if (context.type === 'user' && !hasPortalAccess) {
    const portalAuthRedirect = `${API_AUTH_PORTAL_ROUTE}/${resolvedParams.portalSlug}`;
    const targetRoute = routeWithParam(PROJECT_PORTAL_ROUTE, {
      id: resolvedParams.id,
      portalSlug: resolvedParams.portalSlug
    });

    redirect(`${portalAuthRedirect}?redirect=${encodeURIComponent(targetRoute)}`);
  }

  const effectiveIsOwner = isOwner && !isPreviewMode;

  return (
    <div className="min-h-screen max-w-[80%] mx-auto">
      <PortalHeader isOwner={isOwner} projectId={resolvedParams.id} portalSlug={resolvedParams.portalSlug} />

      <main className="py-2 mb-16">
        <div className="xl:flex space-y-4 xl:space-y-0 xl:gap-4 max-h-screen-minus-header">
          <div className="xl:w-[70%] border border-border rounded-lg shadow-md flex flex-col max-h-screen-minus-header">
            <ProjectTimeline projectId={resolvedParams.id} isOwner={effectiveIsOwner} portalSlug={resolvedParams.portalSlug} />
          </div>

          <div className="xl:w-[30%] flex flex-col gap-4 h-full">
            {isOwner && !isPreviewMode && (
              <div className="border border-border rounded-lg shadow-md flex-shrink-0">
                <PortalClientInfo client={project.client} />
              </div>
            )}

            <div className="flex-1 border border-border rounded-lg shadow-lg overflow-hidden min-h-[400px]">
              <ProjectMessaging project={project} isOwner={effectiveIsOwner} context={context as PortalContext} showClientInfo={isOwner && !isPreviewMode} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
