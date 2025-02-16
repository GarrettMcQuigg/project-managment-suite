import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { Phase } from '@prisma/client';
import { UpdateProjectRequestBody, UpdateProjectRequestBodySchema } from './types';

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return handleUnauthorized();

  const requestBody: UpdateProjectRequestBody = await request.json();

  const { error } = UpdateProjectRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  if (!requestBody.id) {
    return handleBadRequest({ message: 'Missing project ID' });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const clientRecord = requestBody.client.id
        ? await tx.client.update({
            where: { id: requestBody.client.id },
            data: {
              name: requestBody.client.name,
              email: requestBody.client.email,
              phone: requestBody.client.phone
            }
          })
        : await tx.client.create({
            data: {
              userId: currentUser.id,
              name: requestBody.client.name,
              email: requestBody.client.email,
              phone: requestBody.client.phone
            }
          });

      await tx.project.update({
        where: { id: requestBody.id },
        data: {
          name: requestBody.name,
          description: requestBody.description,
          type: requestBody.type,
          status: requestBody.status,
          startDate: requestBody.startDate,
          endDate: requestBody.endDate,
          clientId: clientRecord.id
        }
      });

      // Update invoices - delete existing and create new ones
      await tx.invoice.deleteMany({
        where: { projectId: requestBody.id }
      });

      await Promise.all(
        requestBody.invoices.map((invoice) =>
          tx.invoice.create({
            data: {
              projectId: requestBody.id,
              invoiceNumber: invoice.invoiceNumber,
              type: invoice.type,
              amount: invoice.amount,
              status: invoice.status,
              dueDate: invoice.dueDate,
              notes: invoice.notes,
              phaseId: invoice.phaseId
            }
          })
        )
      );

      // Update phases
      if (requestBody.phases && requestBody.phases.length > 0) {
        await tx.phase.deleteMany({
          where: { projectId: requestBody.id }
        });

        await Promise.all(
          requestBody.phases.map((phase: Phase) =>
            tx.phase.create({
              data: {
                projectId: requestBody.id,
                type: phase.type,
                name: phase.name,
                description: phase.description,
                startDate: new Date(phase.startDate),
                endDate: new Date(phase.endDate),
                status: phase.status,
                order: phase.order
              }
            })
          )
        );
      }

      const completeProject = await tx.project.findUnique({
        where: { id: requestBody.id },
        include: {
          client: true,
          phases: true,
          invoices: true
        }
      });

      return completeProject;
    });

    return handleSuccess({
      message: 'Successfully updated project',
      content: result
    });
  } catch (err: unknown) {
    console.error('Project update error:', err);
    return handleError({ message: 'Failed to update project', err });
  }
}
