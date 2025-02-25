import { handleBadRequest, handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { db } from '@/packages/lib/prisma/client';
import { DeleteInvoiceRequestBody, DeleteInvoiceRequestBodySchema } from './types';

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  const requestBody: DeleteInvoiceRequestBody = await request.json();

  if (!currentUser) {
    return handleUnauthorized();
  }

  const { error } = DeleteInvoiceRequestBodySchema.validate(requestBody);
  if (error) {
    return handleBadRequest({ message: error.message, err: error });
  }

  const { id } = requestBody;

  try {
    await db.invoice.delete({
      where: { id }
    });

    return handleSuccess({
      message: 'Successfully deleted invoice'
    });
  } catch (err) {
    return handleError({ message: 'Failed to delete invoice', err });
  }
}
