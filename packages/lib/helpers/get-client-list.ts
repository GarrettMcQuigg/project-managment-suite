import { db } from '../prisma/client';
import { getCurrentUser } from './get-current-user';

export async function getClientList() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  try {
    const clients = await db.client.findMany({
      include: {
        projects: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        userId: currentUser.id,
        deletedAt: null,
        NOT: {
          email: 'system@deleted.client'
        }
      }
    });
    return clients;
  } catch (error: unknown) {
    console.error('Failed to fetch clients:', error);
    return null;
  }
}
