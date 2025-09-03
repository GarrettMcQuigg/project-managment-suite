import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { UpdateInvoiceRequestBody, UpdateInvoiceRequestBodySchema } from './types';
import { InvoiceStatus, InvoiceType, PaymentMethod } from '@prisma/client';

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: UpdateInvoiceRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = UpdateInvoiceRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    await db.$transaction(async (tx) => {
      let clientId: string | null = null;

      // Handle client data if provided
      if (requestBody.client) {
        if (requestBody.client.id) {
          // Update existing client
          await tx.client.update({
            where: { id: requestBody.client.id },
            data: {
              name: requestBody.client.name,
              email: requestBody.client.email,
              phone: requestBody.client.phone,
              updatedAt: new Date()
            }
          });
          clientId = requestBody.client.id;
        } else {
          // Create new client
          const newClient = await tx.client.create({
            data: {
              name: requestBody.client.name,
              email: requestBody.client.email,
              phone: requestBody.client.phone,
              userId: currentUser.id,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          clientId = newClient.id;
        }
      }

      await tx.invoice.update({
        where: { id: requestBody.id },
        data: {
          invoiceNumber: requestBody.invoiceNumber,
          type: requestBody.type as InvoiceType,
          status: requestBody.status as InvoiceStatus,
          dueDate: new Date(requestBody.dueDate) ?? new Date(),
          notes: requestBody.notes || '',
          paymentMethod: null,
          amount: requestBody.amount,
          clientId: clientId,
          updatedAt: new Date()
        }
      });
    });

    return handleSuccess({
      message: 'Successfully Updated Invoice'
    });
  } catch (err) {
    return handleError({ message: 'Failed to update invoice', err });
  }
}
