import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { CalendarEventStatus, CalendarEventType, Phase } from '@prisma/client';
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
      // Update client
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

      // Update project
      const updatedProject = await tx.project.update({
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

      // Update invoices
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

      // Handle phases
      if (requestBody.phases && requestBody.phases.length > 0) {
        const modifiedPhases = requestBody.phases.filter((phase) => (phase as Phase & { isModified?: boolean }).isModified === true);

        if (modifiedPhases.length > 0) {
          const modifiedPhaseIds = modifiedPhases.map((phase) => phase.id);

          for (const phaseId of modifiedPhaseIds) {
            await tx.calendarEvent.deleteMany({
              where: {
                phaseId: phaseId,
                type: CalendarEventType.PHASE_DEADLINE
              }
            });
          }

          await tx.phase.deleteMany({
            where: {
              id: { in: modifiedPhaseIds },
              projectId: requestBody.id
            }
          });

          await Promise.all(
            modifiedPhases.map(async (phase) => {
              const { ...phaseData } = phase as Phase & { isModified?: boolean };

              const newPhase = await tx.phase.create({
                data: {
                  projectId: requestBody.id,
                  type: phaseData.type,
                  name: phaseData.name,
                  description: phaseData.description,
                  startDate: new Date(phaseData.startDate),
                  endDate: new Date(phaseData.endDate),
                  status: phaseData.status,
                  order: phaseData.order
                }
              });

              await tx.calendarEvent.create({
                data: {
                  title: `${updatedProject.name}: ${newPhase.name}`,
                  description: newPhase.description || '',
                  type: CalendarEventType.PHASE_DEADLINE,
                  startDate: newPhase.startDate,
                  endDate: newPhase.endDate,
                  projectId: updatedProject.id,
                  phaseId: newPhase.id,
                  userId: currentUser.id,
                  status: CalendarEventStatus.SCHEDULED
                }
              });

              return newPhase;
            })
          );
        }
      }

      await tx.calendarEvent.updateMany({
        where: {
          projectId: requestBody.id,
          type: CalendarEventType.PROJECT_TIMELINE
        },
        data: {
          title: updatedProject.name,
          startDate: updatedProject.startDate,
          endDate: updatedProject.endDate
        }
      });

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
