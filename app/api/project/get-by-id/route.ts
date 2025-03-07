import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { NextRequest } from 'next/server';
import { decrypt } from '@/packages/lib/utils/encryption';

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  try {
    const project = await db.project.findUniqueOrThrow({
      where: {
        id: id?.toString(),
        userId: currentUser.id,
        deletedAt: null
      },
      include: {
        client: true,
        phases: true,
        invoices: true
      }
    });

    if (project) {
      project.portalPassEncryption = decrypt(project.portalPassEncryption);
    }

    return handleSuccess({ content: project });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to fetch project', err });
  }
}
