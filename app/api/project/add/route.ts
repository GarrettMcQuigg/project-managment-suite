import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AddProjectRequestBody, AddProjectRequestBodySchema } from './types';
import { hash } from 'bcrypt';
import { generatePortalSlug, generateSecurePassword } from '@/packages/lib/helpers/project-portals';
import { CalendarEventStatus, CalendarEventType } from '@prisma/client';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return handleUnauthorized();

  let requestBody: AddProjectRequestBody = await request.json();

  if (requestBody.client && (requestBody.client.id === '' || requestBody.client.id === undefined)) {
    const { ...clientWithoutId } = requestBody.client;
    requestBody = {
      ...requestBody,
      client: clientWithoutId
    };
  }

  const { error } = AddProjectRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  const { client, name, description, type, status, startDate, endDate, phases, invoices } = requestBody;

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Check for existing client with this email for the current user
      let clientRecord;

      if (client.id) {
        clientRecord = await tx.client.findUnique({
          where: { id: client.id }
        });
      } else {
        clientRecord = await tx.client.findUnique({
          where: {
            userId_email: {
              userId: currentUser.id,
              email: client.email!
            }
          }
        });

        if (!clientRecord) {
          clientRecord = await tx.client.create({
            data: {
              userId: currentUser.id,
              name: client.name!,
              email: client.email!,
              phone: client.phone!
            }
          });
        }
      }

      if (!clientRecord) {
        return handleError({ message: 'Failed to create project' });
      }

      const portalSlug = generatePortalSlug();
      const portalPassword = generateSecurePassword();
      const hashedPassword = await hash(portalPassword, 10);

      // 2. Create the project
      const projectRecord = await tx.project.create({
        data: {
          name,
          description,
          type,
          status,
          startDate,
          endDate,
          userId: currentUser.id,
          clientId: clientRecord.id,
          portalPass: hashedPassword,
          portalSlug
        }
      });

      // 3. Create invoices
      const createdInvoices = await Promise.all(
        invoices.map((invoice) =>
          tx.invoice.create({
            data: {
              projectId: projectRecord.id,
              invoiceNumber: invoice.invoiceNumber,
              type: invoice.type,
              amount: String(invoice.amount),
              status: invoice.status,
              dueDate: invoice.dueDate,
              notes: invoice.notes,
              phaseId: invoice.phaseId
            }
          })
        )
      );

      // 4. Create phases
      const createdPhases = await Promise.all(
        phases.map((phase) =>
          tx.phase.create({
            data: {
              projectId: projectRecord.id,
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

      // 5. Create Calendar Events
      await tx.calendarEvent.create({
        data: {
          title: projectRecord.name,
          type: CalendarEventType.PROJECT_TIMELINE,
          startDate: projectRecord.startDate,
          endDate: projectRecord.endDate,
          projectId: projectRecord.id,
          userId: currentUser.id,
          status: CalendarEventStatus.SCHEDULED
        }
      });

      await tx.calendarEvent.createMany({
        data: createdPhases.map((phase) => ({
          title: `${projectRecord.name}: ${phase.name}`,
          description: phase.description || '',
          type: CalendarEventType.PHASE_DEADLINE,
          startDate: phase.startDate,
          endDate: phase.endDate,
          projectId: projectRecord.id,
          phaseId: phase.id,
          userId: currentUser.id,
          status: CalendarEventStatus.SCHEDULED
        }))
      });

      return {
        project: projectRecord,
        phases: createdPhases,
        invoices: createdInvoices,
        client: clientRecord,
        isNewClient: !client.id,
        portalPassword
      };
    });

    return handleSuccess({ message: 'Successfully created project', content: result });
  } catch (err: unknown) {
    console.error('Project creation error:', err);
    return handleError({ message: 'Failed to create project', err });
  }
}
