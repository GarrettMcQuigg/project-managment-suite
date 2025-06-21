import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AddProjectRequestBody, AddProjectRequestBodySchema } from './types';
import { hash } from 'bcrypt';
import { generatePortalSlug, generateSecurePassword } from '@/packages/lib/helpers/project-portals';
import { CalendarEventStatus, CalendarEventType } from '@prisma/client';
import { encrypt } from '@/packages/lib/utils/encryption';
import { UpdateProjectMetrics } from '@/packages/lib/helpers/analytics/project/project-metrics';
import { createInvoiceCheckout, createConnectInvoiceCheckout } from '@/packages/lib/stripe/invoice-checkout';

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
      const encryptedPortalPassword = await encrypt(portalPassword);

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
          portalPassEncryption: encryptedPortalPassword,
          portalSlug
        }
      });

      // 3. Create invoices
      const createdInvoices = await Promise.all(
        invoices.map((invoice) =>
          tx.invoice.create({
            data: {
              userId: currentUser.id,
              projectId: projectRecord.id,
              clientId: clientRecord.id,
              invoiceNumber: invoice.invoiceNumber,
              type: invoice.type,
              amount: String(invoice.amount),
              status: invoice.status,
              dueDate: invoice.dueDate,
              notifyClient: invoice.notifyClient,
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
        portalPassword,
        invoiceCheckouts: [] as { invoiceId: string; checkoutUrl: string | null; sessionId: string | null }[]
      };
    });

    if ('invoices' in result && result.invoices.length > 0) {
      // Check user's Stripe account status
      const user = await db.user.findUnique({
        where: { id: currentUser.id },
        select: { stripeAccountId: true, stripeAccountStatus: true }
      });

      const origin = request.url.split('/api/')[0];

      // Create checkout sessions in parallel
      const checkoutPromises = result.invoices.map(async (invoice) => {
        try {
          // If user has a verified Stripe account, create invoice on their account
          if (user?.stripeAccountId && user.stripeAccountStatus === 'VERIFIED') {
            const checkout = await createConnectInvoiceCheckout(
              invoice.id,
              currentUser.id,
              user.stripeAccountId,
              origin
            );
            return {
              content: {
                checkoutUrl: checkout.checkoutUrl,
                sessionId: checkout.sessionId,
                isConnectCheckout: true
              }
            };
          } else {
            // Use regular checkout
            const checkout = await createInvoiceCheckout(
              invoice.id,
              currentUser.id,
              origin
            );
            return {
              content: {
                checkoutUrl: checkout.checkoutUrl,
                sessionId: checkout.sessionId,
                isConnectCheckout: false
              }
            };
          }
        } catch (error) {
          console.error('Error creating checkout for invoice:', invoice.id, error);
          return {
            content: {
              checkoutUrl: null,
              sessionId: null,
              isConnectCheckout: false
            }
          };
        }
      });

      const checkoutResults = await Promise.all(checkoutPromises);
      
      // Attach checkout URLs to the response
      result.invoiceCheckouts = checkoutResults.map((checkout, index) => ({
        invoiceId: result.invoices[index].id,
        checkoutUrl: checkout.content?.checkoutUrl || null,
        sessionId: checkout.content?.sessionId || null,
        isConnectCheckout: !!checkout.content?.isConnectCheckout
      }));
    }

    await UpdateProjectMetrics(currentUser.id);

    return handleSuccess({ message: 'Successfully created project', content: result });
  } catch (err: unknown) {
    console.error('Project creation error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return handleError({ 
      message: 'Failed to create project', 
      err: {
        message: errorMessage,
        ...(err instanceof Error && {
          name: err.name,
          stack: err.stack,
          ...(err as any).code && { code: (err as any).code }
        })
      }
    });
  }
}