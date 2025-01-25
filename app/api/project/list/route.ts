import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  try {
    const projects = await db.project.findMany({
      where: {
        userId: currentUser.id,
        deletedAt: null
      },
      include: {
        client: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return handleSuccess({ content: projects });
  } catch (err: any) {
    return handleError({ message: 'Failed to fetch projects', err });
  }
}
