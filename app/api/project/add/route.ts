import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AddProjectRequestBody, AddProjectRequestBodySchema } from './types';
import { hash } from 'bcrypt';
import { generatePortalSlug, generateSecurePassword } from '@/packages/lib/helpers/project-portals';

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

  const { client, name, description, type, status, startDate, endDate, phases, payment } = requestBody;

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

      // 3. Create the payment record
      await tx.projectPayment.create({
        data: {
          projectId: projectRecord.id,
          totalAmount: payment.totalAmount,
          depositRequired: payment.depositRequired || 0,
          depositDueDate: payment.depositDueDate || null,
          paymentSchedule: payment.paymentSchedule,
          notes: payment.notes || null,
          amountPaid: 0
        }
      });

      // 4. Create all phases
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

      return {
        project: projectRecord,
        phases: createdPhases,
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
