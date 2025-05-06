import { handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { db } from '@/packages/lib/prisma/client';
import { ROOT_ROUTE } from '@/packages/lib/routes';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        project: true,
        client: true
      }
    });

    if (!invoice) {
      return handleError({ message: 'Invoice not found' });
    }

    if (invoice.userId !== currentUser.id) {
      return handleError({ message: 'Unauthorized access to invoice' });
    }

    const clientEmail = invoice.client.email;
    if (!clientEmail) {
      return handleError({ message: 'Client email not found' });
    }

    // Convert amount from string to number (in cents for Stripe)
    const amount = invoice.amount || '0';
    const amountInCents = Math.round(parseFloat(amount) * 100);

    let session;
    if (invoice.project) {
      // Create Checkout Session
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: clientEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd', // TODO : May want to make this configurable
              product_data: {
                name: `Invoice #${invoice.invoiceNumber} - ${invoice.project.name}`,
                description: invoice.notes || undefined
              },
              unit_amount: amountInCents
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${req.nextUrl.origin}/invoice/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.nextUrl.origin}${ROOT_ROUTE}`,
        metadata: {
          invoiceId: invoice.id,
          projectId: invoice.projectId,
          userId: currentUser.id
        }
      });
    } else {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: clientEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd', // TODO : May want to make this configurable
              product_data: {
                name: `Invoice #${invoice.invoiceNumber}`,
                description: invoice.notes || undefined
              },
              unit_amount: amountInCents
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${req.nextUrl.origin}/invoice/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.nextUrl.origin}${ROOT_ROUTE}`,
        metadata: {
          invoiceId: invoice.id,
          projectId: invoice.projectId,
          userId: currentUser.id
        }
      });
    }

    // Store the checkout session ID with the invoice
    await db.invoice.update({
      where: { id: invoice.id },
      data: {
        stripeCheckoutId: session.id,
        stripeCheckoutUrl: session.url || ''
      }
    });

    return handleSuccess({
      message: 'Checkout session created',
      content: {
        checkoutUrl: session.url,
        sessionId: session.id
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
