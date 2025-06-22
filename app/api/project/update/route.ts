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
    const transactionResult = await db.$transaction(async (tx) => {
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

      // Get existing invoices for this project
      const existingInvoices = await tx.invoice.findMany({
        where: { projectId: requestBody.id },
        select: {
          id: true,
          invoiceNumber: true,
          type: true,
          amount: true,
          status: true,
          dueDate: true,
          notes: true,
          phaseId: true,
          stripeCheckoutUrl: true,
          stripeCheckoutId: true
        }
      });

      // Process invoice updates
      const invoiceUpdates = await Promise.all(
        requestBody.invoices.map(async (invoice) => {
          const existingInvoice = existingInvoices.find(
            (inv) => inv.id === invoice.id
          );

          const updateData = {
            invoiceNumber: invoice.invoiceNumber,
            type: invoice.type,
            amount: invoice.amount.toString(),
            status: invoice.status,
            dueDate: invoice.dueDate,
            notes: invoice.notes || undefined,
            phaseId: invoice.phaseId || undefined,
            updatedAt: new Date()
          };

          // If invoice exists, update it
          if (existingInvoice) {
            // Check if any invoice data has changed
            const hasChanges = Object.entries(updateData).some(
              ([key, value]) => {
                // Skip checking these fields when determining if there are changes
                if (key === 'stripeCheckoutUrl' || key === 'stripeCheckoutId' || key === 'updatedAt') {
                  return false;
                }
                return existingInvoice[key as keyof typeof existingInvoice] !== value;
              }
            );

            // Only update if there are changes
            if (hasChanges) {
              // For existing invoices with changes, we'll create a new checkout session
              // after the transaction completes
              return tx.invoice.update({
                where: { id: invoice.id },
                data: {
                  ...updateData,
                  // Clear the checkout URL/ID since we'll create a new one
                  stripeCheckoutUrl: null,
                  stripeCheckoutId: null
                }
              });
            }
            return existingInvoice;
          } else {
            // Create new invoice
            return tx.invoice.create({
              data: {
                userId: currentUser.id,
                projectId: requestBody.id,
                clientId: clientRecord.id,
                ...updateData,
                amount: updateData.amount.toString() // Ensure amount is a string
              }
            });
          }
        })
      );

      // Delete invoices that were removed
      const incomingInvoiceIds = requestBody.invoices
        .map((inv) => inv.id)
        .filter(Boolean);
      const invoicesToDelete = existingInvoices.filter(
        (inv) => !incomingInvoiceIds.includes(inv.id)
      );

      if (invoicesToDelete.length > 0) {
        await tx.invoice.deleteMany({
          where: { id: { in: invoicesToDelete.map((inv) => inv.id) } }
        });
      }

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

      return { updatedProject: completeProject, updatedInvoices: invoiceUpdates };
    });

    const { updatedProject, updatedInvoices } = transactionResult;

    // After transaction completes successfully, handle Stripe checkout sessions
    try {
      // Get user's Stripe account status
      const user = await db.user.findUnique({
        where: { id: currentUser.id },
        select: { stripeAccountId: true, stripeAccountStatus: true }
      });

      const origin = request.url.split('/api/')[0];
      const { createConnectInvoiceCheckout, createInvoiceCheckout } = await import('@/packages/lib/stripe/invoice-checkout');

      // Process each updated invoice that needs a new checkout session
      for (const invoice of updatedInvoices || []) {
        // Only create checkout for invoices that were just created or had changes
        // (existing invoices with no changes will have their original checkout URLs preserved)
        if (!invoice.stripeCheckoutUrl) {
          try {
            let checkoutUrl: string | null = null;
            let checkoutId: string | null = null;

            // Create appropriate checkout session based on user's Stripe account status
            if (user?.stripeAccountId && user.stripeAccountStatus === 'VERIFIED') {
              const checkout = await createConnectInvoiceCheckout(
                invoice.id,
                currentUser.id,
                user.stripeAccountId,
                origin
              );
              checkoutUrl = checkout.checkoutUrl;
              checkoutId = checkout.sessionId;
            } else {
              const checkout = await createInvoiceCheckout(
                invoice.id,
                currentUser.id,
                origin
              );
              checkoutUrl = checkout.checkoutUrl;
              checkoutId = checkout.sessionId;
            }

            // Update the invoice with the new checkout URL and ID
            if (checkoutUrl && checkoutId) {
              await db.invoice.update({
                where: { id: invoice.id },
                data: {
                  stripeCheckoutUrl: checkoutUrl,
                  stripeCheckoutId: checkoutId
                }
              });
            }
          } catch (error) {
            console.error(`Failed to create checkout session for invoice ${invoice.id}:`, error);
            // Continue with other invoices even if one fails
          }
        }
      }


        if (!updatedProject) {
        throw new Error('Failed to update project');
      }

      // Refresh the project data to include any updated invoice URLs
      const completeProject = await db.project.findUnique({
        where: { id: updatedProject.id },
        include: {
          client: true,
          phases: true,
          invoices: true
        }
      });

      if (!completeProject) {
        throw new Error('Failed to fetch updated project');
      }

      return handleSuccess({
        message: 'Successfully updated project',
        content: completeProject
      });
    } catch (error) {
      console.error('Error creating checkout sessions:', error);
      // Even if checkout session creation fails, we still return success since the project was updated
      // The checkout URLs can be regenerated later if needed
      return handleSuccess({
        message: 'Project updated, but there was an issue updating payment links',
        content: updatedProject
      });
    }
  } catch (err: unknown) {
    console.error('Project update error:', err);
    return handleError({ message: 'Failed to update project', err });
  }
}
