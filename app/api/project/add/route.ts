import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AddProjectRequestBody, AddProjectRequestBodySchema } from './types';
import { hash } from 'bcrypt';
import { generatePortalSlug } from '@/packages/lib/helpers/portal/password-generator';
import { CalendarEventStatus, CalendarEventType } from '@prisma/client';
import { encrypt } from '@/packages/lib/utils/encryption';
import { UpdateProjectMetrics } from '@/packages/lib/helpers/analytics/project/project-metrics';
import { createInvoiceCheckout, createConnectInvoiceCheckout } from '@/packages/lib/stripe/invoice-checkout';
import EmailService from '@/packages/lib/utils/email-service';
import { format } from 'date-fns';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return handleUnauthorized();

  let requestBody: AddProjectRequestBody = await request.json();

  // TODO : This doesnt do anything... right?
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

  const { client, name, description, type, status, startDate, endDate, portalPassword, checkpoints, invoices } = requestBody;

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
      const hashedPassword = await hash(portalPassword, 10);
      const encryptedPortalPassword = await encrypt(portalPassword);

      console.log('portalPassword', portalPassword);
      console.log('hashedPassword', hashedPassword);
      console.log('encryptedPortalPassword', encryptedPortalPassword);

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
              checkpointId: invoice.checkpointId
            }
          })
        )
      );

      // 4. Create checkpoints
      const createdCheckpoints = await Promise.all(
        checkpoints.map((checkpoint) =>
          tx.checkpoint.create({
            data: {
              projectId: projectRecord.id,
              type: checkpoint.type,
              name: checkpoint.name,
              description: checkpoint.description,
              startDate: new Date(checkpoint.startDate),
              endDate: new Date(checkpoint.endDate),
              status: checkpoint.status,
              order: checkpoint.order
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
        data: createdCheckpoints.map((checkpoint) => ({
          title: checkpoint.name ? `${projectRecord.name}: ${checkpoint.name}` : `${projectRecord.name}: ${checkpoint.type}`,
          description: checkpoint.description || '',
          type: CalendarEventType.CHECKPOINT_DEADLINE,
          startDate: checkpoint.startDate,
          endDate: checkpoint.endDate,
          projectId: projectRecord.id,
          checkpointId: checkpoint.id,
          userId: currentUser.id,
          status: CalendarEventStatus.SCHEDULED
        }))
      });

      // 6. Create Calendar Events for Invoices
      await tx.calendarEvent.createMany({
        data: createdInvoices.map((invoice) => ({
          title: `Invoice Due: ${invoice.invoiceNumber}`,
          description: `Invoice for ${projectRecord.name} - $${invoice.amount}`,
          type: CalendarEventType.INVOICE_DUE,
          startDate: invoice.dueDate,
          endDate: invoice.dueDate,
          projectId: projectRecord.id,
          invoiceId: invoice.id,
          userId: currentUser.id,
          status: CalendarEventStatus.SCHEDULED
        }))
      });

      return {
        project: projectRecord,
        checkpoints: createdCheckpoints,
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
            const checkout = await createConnectInvoiceCheckout(invoice.id, currentUser.id, user.stripeAccountId, origin);
            return {
              content: {
                checkoutUrl: checkout.checkoutUrl,
                sessionId: checkout.sessionId,
                isConnectCheckout: true
              }
            };
          } else {
            // Use regular checkout
            const checkout = await createInvoiceCheckout(invoice.id, currentUser.id, origin);
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

      // Attach checkout URLs to the response and send emails if notifyClient is true
      result.invoiceCheckouts = await Promise.all(
        checkoutResults.map(async (checkout, index) => {
          const invoice = result.invoices[index];
          const checkoutUrl = checkout.content?.checkoutUrl || null;
          const sessionId = checkout.content?.sessionId || null;
          const isConnectCheckout = !!checkout.content?.isConnectCheckout;

          // Send email notification if notifyClient is true and we have a checkout URL
          if (invoice.notifyClient && checkoutUrl && result.client?.email) {
            try {
              const emailService = new EmailService();
              await emailService.sendInvoicePaymentEmail({
                to: result.client.email,
                invoiceNumber: invoice.invoiceNumber,
                projectName: result.project?.name || 'Project',
                amount: invoice.amount ? `$${parseFloat(invoice.amount).toFixed(2)}` : 'Not Provided',
                dueDate: invoice.dueDate ? format(new Date(invoice.dueDate), 'MMMM d, yyyy') : 'Upon receipt',
                paymentLink: checkoutUrl,
                companyName: currentUser.firstname + ' ' + currentUser.lastname || 'Your Service Provider', // TODO : May want to add company name to user model
                clientName: result.client.name || 'Valued Client',
                notes: invoice.notes || undefined
              });
              // Update the invoice to mark that notification was sent
              await db.invoice.update({
                where: { id: invoice.id },
                data: {
                  notificationSent: true,
                  notificationSentAt: new Date()
                }
              });
            } catch (error) {
              console.error('Failed to send invoice notification email:', error);
              // Don't fail the whole request if email sending fails
            }
          }

          return {
            invoiceId: invoice.id,
            checkoutUrl,
            sessionId,
            isConnectCheckout
          };
        })
      );
    }

    await UpdateProjectMetrics(currentUser.id);

    return handleSuccess({ message: 'Successfully created project', content: result });
  } catch (err: unknown) {
    console.error('Project creation error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return handleError({
      message: 'Failed to create project',
      err: {
        message: errorMessage
      }
    });
  }
}
