import { db } from '../prisma/client';
import { ProjectWithMetadata } from '../prisma/types';
import { getCurrentUser } from './get-current-user';

export async function getProjectList(): Promise<ProjectWithMetadata[] | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  try {
    const projects = await db.project.findMany({
      include: {
        client: true,
        checkpoints: true,
        invoices: true,
        user: true,
        attachments: true,
        messages: {
          include: {
            attachments: true
          }
        },
        portalViews: true,
        calendarEvent: true
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
    return projects as ProjectWithMetadata[];
  } catch (error: unknown) {
    console.error('Failed to fetch projects:', error);
    return null;
  }
}
