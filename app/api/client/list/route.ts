import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  try {
    const clients = await db.client.findMany({
      where: {
        userId: currentUser.id,
        isArchived: false,
        deletedAt: null,
        NOT: {
          email: 'system@deleted.client'
        }
      },
      include: {
        projects: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return handleSuccess({ content: clients });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to fetch clients', err });
  }
}
