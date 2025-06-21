import { handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { NextRequest } from 'next/server';
import { createInvoiceCheckout } from '@/packages/lib/stripe/invoice-checkout';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return handleUnauthorized();
    }

    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return handleError({ message: 'Missing required parameter: invoiceId' });
    }

    const origin = req.nextUrl.origin;
    const checkout = await createInvoiceCheckout(invoiceId, currentUser.id, origin);

    return handleSuccess({
      message: 'Checkout session created',
      content: {
        checkoutUrl: checkout.checkoutUrl,
        sessionId: checkout.sessionId
      }
    });
  } catch (err) {
    console.error('Error creating invoice checkout session:', err);
    return handleError({
      message: 'Error creating invoice checkout session',
      err
    });
  }
}