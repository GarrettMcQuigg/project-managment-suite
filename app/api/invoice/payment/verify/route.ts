import { handleError, handleSuccess } from '@/packages/lib/helpers/api-response-handlers';
import { db } from '@/packages/lib/prisma/client';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return handleError({ message: 'Missing sessionId parameter' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return handleError({ message: 'Invalid session ID' });
    }

    // Check if this is an invoice payment session
    if (session.mode !== 'payment' || !session.metadata?.invoiceId) {
      return handleError({ message: 'Not an invoice payment session' });
    }

    // Find the invoice in your database
    const invoice = await db.invoice.findUnique({
      where: { id: session.metadata.invoiceId },
      include: {
        project: true
      }
    });

    if (!invoice) {
      return handleError({ message: 'Invoice not found' });
    }

    // Return basic payment info
    return handleSuccess({
      content: {
        invoiceNumber: invoice.invoiceNumber,
        amount: (session.amount_total ? session.amount_total / 100 : 0).toFixed(2),
        status: 'paid'
      }
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    return handleError({
      message: 'Error verifying payment',
      err
    });
  }
}
