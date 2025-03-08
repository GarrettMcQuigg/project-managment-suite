import { db } from '../../prisma/client';
import { getSessionContext } from './get-session-context';

export async function hasProjectAccess(projectId: string): Promise<boolean> {
  const context = await getSessionContext();

  // Garrett TODO: Could cause issues with authenticated users who DO NOT own the project but DO have portal access from the password
  // (MAYBE) If user owns the project, return true, if user does not own the project, check if the user has portal access
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
