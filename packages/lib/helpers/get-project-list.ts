import { db } from '../prisma/client';
import { getCurrentUser } from './get-current-user';

export async function getProjects() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  try {
    const projects = await db.project.findMany({
      include: {
        client: true,
        phases: true,
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        userId: currentUser.id,
        NOT: {
          status: 'DELETED'
        }
      }
    });
    return projects;
  } catch (error: unknown) {
    console.error('Failed to fetch projects:', error);
    return null;
  }
}
