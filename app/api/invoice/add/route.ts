import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AddInvoiceRequestBody, AddInvoiceRequestBodySchema } from './types';
import { InvoiceStatus, InvoiceType, PaymentMethod, CalendarEventType, CalendarEventStatus } from '@prisma/client';
import { createInvoiceCheckout, createConnectInvoiceCheckout } from '@/packages/lib/stripe/invoice-checkout';
// import EmailService from '@/packages/lib/utils/email-service';
// import { format } from 'date-fns';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: AddInvoiceRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = AddInvoiceRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          userId: currentUser.id,
          invoiceNumber: requestBody.invoiceNumber,
          type: requestBody.type as InvoiceType,
          status: requestBody.status as InvoiceStatus,
          dueDate: new Date(requestBody.dueDate) ?? new Date(),
          notes: requestBody.notes || '',
          paymentMethod: (requestBody.paymentMethod as PaymentMethod) ?? null,
          amount: requestBody.amount,
          notifyClient: requestBody.notifyClient || false,
          projectId: requestBody.projectId || null,
          clientId: requestBody.clientId || null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          client: true,
          project: true
        }
      });

      // Create calendar event for the invoice
      await tx.calendarEvent.create({
        data: {
          title: `Invoice Due: ${invoice.invoiceNumber}`,
          description: `Invoice${invoice.project ? ` for ${invoice.project.name}` : ''} - $${invoice.amount}`,
          type: CalendarEventType.INVOICE_DUE,
          startDate: invoice.dueDate,
          endDate: invoice.dueDate,
          projectId: invoice.projectId,
          invoiceId: invoice.id,
          userId: currentUser.id,
          status: CalendarEventStatus.SCHEDULED
        }
      });

      return invoice;
    });

    const invoice = result;

    // If notifyClient is true, create a checkout session and send email
    if (requestBody.notifyClient && invoice.client) {
      try {
        // Get user's Stripe account status and name
        const user = await db.user.findUnique({
          where: { id: currentUser.id },
          select: {
            stripeAccountId: true,
            stripeAccountStatus: true,
            firstname: true,
            lastname: true
          }
        });

        const origin = request.url.split('/api/')[0];
        let checkoutUrl: string | null = null;

        // Create checkout session
        if (user?.stripeAccountId && user.stripeAccountStatus === 'VERIFIED') {
          const checkout = await createConnectInvoiceCheckout(invoice.id, currentUser.id, user.stripeAccountId, origin);
          checkoutUrl = checkout.checkoutUrl;
        } else {
          const checkout = await createInvoiceCheckout(invoice.id, currentUser.id, origin);
          checkoutUrl = checkout.checkoutUrl;
        }

        if (checkoutUrl) {
          // TODO: Implement email notification when MailGun is added
          console.log('sending email notification');
          // Send email notification
          // const emailService = new EmailService();
          // await emailService.sendInvoicePaymentEmail({
          //   to: invoice.client?.email || '',
          //   invoiceNumber: invoice.invoiceNumber,
          //   projectName: invoice.project?.name || undefined,
          //   amount: invoice.amount ? `$${parseFloat(invoice.amount).toFixed(2)}` : '$0.00',
          //   dueDate: invoice.dueDate ? format(new Date(invoice.dueDate), 'MMMM d, yyyy') : 'Upon receipt',
          //   paymentLink: checkoutUrl,
          //   companyName: user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Your Service Provider' : 'Your Service Provider',
          //   clientName: invoice.client?.name || 'Valued Client',
          //   notes: invoice.notes || undefined
          // });

          // Update the invoice to mark that notification was sent
          // await db.invoice.update({
          //   where: { id: invoice.id },
          //   data: {
          //     notificationSent: true,
          //     notificationSentAt: new Date()
          //   }
          // });
        }
      } catch (error) {
        console.error('Failed to send invoice notification email:', error);
        // Don't fail the whole request if email sending fails
      }
    }

    return handleSuccess({
      message: 'Successfully Created Invoice',
      content: { invoice }
    });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return handleError({
      message: 'Failed to create invoice',
      err: err instanceof Error ? err : new Error('An unknown error occurred')
    });
  }
}
