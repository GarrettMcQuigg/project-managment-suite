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
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Project ID is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const invoices = await db.invoice.findMany({
      where: {
        projectId: projectId,
        userId: currentUser.id
      },
      include: {
        project: true,
        client: true,
        checkpoint: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return handleSuccess({ content: invoices });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to fetch invoices', err });
  }
}
