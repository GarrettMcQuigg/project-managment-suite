import { db } from '@/packages/lib/prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { DeleteProjectRequestBody, DeleteProjectRequestBodySchema } from './types';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: DeleteProjectRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = DeleteProjectRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    await db.$transaction(async (tx) => {
      const { id } = requestBody;

      await tx.phase.deleteMany({
        where: { projectId: id }
      });

      await tx.projectAttachment.deleteMany({
        where: { projectId: id }
      });

      await tx.projectParticipant.deleteMany({
        where: { projectId: id }
      });

      await tx.projectMessage.deleteMany({
        where: { projectId: id }
      });

      await tx.invoice.updateMany({
        where: { projectId: id },
        data: {
          status: 'VOID',
          notes: `Invoice voided due to project deletion on ${new Date().toISOString()}`
        }
      });

      await tx.calendarEvent.deleteMany({
        where: { projectId: id }
      });

      await tx.project.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'DELETED'
        }
      });
    });

    return handleSuccess({ message: 'Successfully Deleted Project' });
  } catch (err: unknown) {
    console.error('Project deletion error:', err);
    return handleError({ message: 'Failed to delete project', err });
  }
}
