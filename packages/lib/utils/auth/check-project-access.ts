import { db } from '../../prisma/client';
import { getSessionContext } from './get-session-context';

export async function hasProjectAccess(projectId: string): Promise<boolean> {
  const context = await getSessionContext();

  if (context.type === 'user') {
    // Check if user owns this project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: context.user.id
      }
    });
    return !!project;
  }

  if (context.type === 'portal') {
    // Check if portal visitor has access to this project
    return context.visitor.projectId === projectId;
  }

  return false;
}
