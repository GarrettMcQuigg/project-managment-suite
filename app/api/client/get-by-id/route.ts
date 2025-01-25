import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  try {
    const client = await db.client.findUniqueOrThrow({
      where: {
        id: id?.toString(),
        isArchived: false,
        deletedAt: null
      },
      include: {
        projects: true
      }
    });

    return handleSuccess({ content: client });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to fetch client', err });
  }
}
