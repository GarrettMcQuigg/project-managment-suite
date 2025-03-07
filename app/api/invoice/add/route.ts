import { db } from '@packages/lib/prisma/client';
import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AddInvoiceRequestBody, AddInvoiceRequestBodySchema } from './types';
import { InvoiceStatus, InvoiceType, PaymentMethod } from '@prisma/client';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: AddInvoiceRequestBody = await request.json();

  if (!currentUser) return handleUnauthorized();

  const { error } = AddInvoiceRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  try {
    await db.invoice.create({
      data: {
        userId: currentUser.id,
        invoiceNumber: requestBody.invoiceNumber,
        type: requestBody.type as InvoiceType,
        status: requestBody.status as InvoiceStatus,
        dueDate: new Date(requestBody.dueDate) ?? new Date(),
        notes: requestBody.notes || '',
        paymentMethod: (requestBody.paymentMethod as PaymentMethod) ?? null,
        amount: requestBody.amount,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return handleSuccess({
      message: 'Successfully Created Invoice'
    });
  } catch (err) {
    return handleError({ message: 'Failed to create invoice', err });
  }
}
