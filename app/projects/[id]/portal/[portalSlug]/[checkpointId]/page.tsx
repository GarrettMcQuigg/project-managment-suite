import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { API_AUTH_PORTAL_ROUTE, routeWithParam, PROJECT_PORTAL_ROUTE, AUTH_SIGNIN_ROUTE } from '@/packages/lib/routes';
import { getProjectForPortalAccess } from '@/packages/lib/helpers/get-project-by-id';
import { validatePortalSessionForProject, getPortalSessionCookieName } from '@/packages/lib/helpers/portal/portal-session';
import CheckpointMessages from './_src/checkpoint-messages';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

export default async function CheckpointDetailsPage({ params }: { params: Promise<{ id: string; portalSlug: string; checkpointId: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const context = await getSessionContext();

  const project: ProjectWithMetadata | null = await getProjectForPortalAccess(resolvedParams.id);

  if (!project) {
    redirect(AUTH_SIGNIN_ROUTE);
  }

  if (project.portalSlug !== resolvedParams.portalSlug) {
    redirect(AUTH_SIGNIN_ROUTE);
  }

  const isOwner = context.type === 'user' && context.user.id === project.userId;
  const currentUserName = context.type === 'user' ? context.user.firstname + ' ' + context.user.lastname : context.type === 'portal' ? context.visitor.name : handleUnauthorized();

  let portalSession = null;

  const sessionCookieName = getPortalSessionCookieName(resolvedParams.id);
  const sessionCookie = cookieStore.get(sessionCookieName);

  if (sessionCookie?.value) {
    portalSession = await validatePortalSessionForProject(sessionCookie.value, resolvedParams.id);
  }

  const hasPortalAccess = !!portalSession;

  if (context.type === 'none' && !hasPortalAccess && !isOwner) {
    const portalAuthRedirect = `${API_AUTH_PORTAL_ROUTE}/${resolvedParams.portalSlug}`;
    const targetRoute = routeWithParam(PROJECT_PORTAL_ROUTE, {
      id: resolvedParams.id,
      portalSlug: resolvedParams.portalSlug
    });

    redirect(`${portalAuthRedirect}?redirect=${encodeURIComponent(targetRoute)}`);
  } else if (context.type === 'user' && !hasPortalAccess && !isOwner) {
    const portalAuthRedirect = `${API_AUTH_PORTAL_ROUTE}/${resolvedParams.portalSlug}`;
    const targetRoute = routeWithParam(PROJECT_PORTAL_ROUTE, {
      id: resolvedParams.id,
      portalSlug: resolvedParams.portalSlug
    });

    redirect(`${portalAuthRedirect}?redirect=${encodeURIComponent(targetRoute)}`);
  }

  // Find the specific checkpoint
  const checkpoint = project.checkpoints.find((c) => c.id === resolvedParams.checkpointId);

  if (!checkpoint) {
    redirect(
      routeWithParam(PROJECT_PORTAL_ROUTE, {
        id: resolvedParams.id,
        portalSlug: resolvedParams.portalSlug
      })
    );
  }

  return (
    <div className="min-h-screen max-w-[80%] mx-auto">
      <main className="py-6">
        <CheckpointMessages projectId={resolvedParams.id} checkpoint={checkpoint} project={project} isOwner={isOwner} currentUserName={currentUserName as string} />
      </main>
    </div>
  );
}
