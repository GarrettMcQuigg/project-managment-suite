import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { ProjectRequestBody, ProjectRequestBodySchema } from './types';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: ProjectRequestBody = await request.json();

  if (!currentUser) {
    return handleUnauthorized();
  }

  const { error } = ProjectRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  if (!process.env.JWT_SECRET) {
    return handleError({ message: 'JWT_SECRET environment variable not set.', err: error });
  }

  try {
    await db.project.create({
      data: {
        userId: currentUser.id,
        clientId: requestBody.clientId,
        type: requestBody.type,
        name: requestBody.name,
        description: requestBody.description,
        startDate: requestBody.startDate,
        endDate: requestBody.endDate
      }
    });

    return handleSuccess({ message: 'Verification code sent!' });
  } catch (err: unknown) {
    return handleError({ message: 'An error occurred. Please try again later.', err });
  }
}
