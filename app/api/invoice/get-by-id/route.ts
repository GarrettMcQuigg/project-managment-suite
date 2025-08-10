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
    const invoice = await db.invoice.findUniqueOrThrow({
      where: {
        id: id?.toString(),
        userId: currentUser.id
      },
      include: {
        project: true,
        client: true,
        payments: true,
        checkpoint: true
      }
    });

    return handleSuccess({ content: invoice });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to fetch invoice', err });
  }
}
