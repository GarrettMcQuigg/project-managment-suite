import { User } from '@prisma/client';
import { getCurrentUser } from '../../helpers/get-current-user';
import { getCurrentPortalVisitor, PortalVisitor } from '../../helpers/portal/get-portal-user';

export async function getSessionContext(): Promise<{ type: 'user'; user: User } | { type: 'portal'; visitor: PortalVisitor } | { type: 'none' }> {
  const user = await getCurrentUser();
  if (user) {
    return { type: 'user', user };
  }

  const portalVisitor = await getCurrentPortalVisitor();
  if (portalVisitor) {
    return { type: 'portal', visitor: portalVisitor };
  }

  return { type: 'none' };
}
