import Stripe from 'stripe';
import { db } from '@/packages/lib/prisma/client';
import { ROOT_ROUTE } from '@/packages/lib/routes';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function createInvoiceCheckout(invoiceId: string, userId: string, origin: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      project: true,
      client: true
    }
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.userId !== userId) {
    throw new Error('Unauthorized access to invoice');
  }

  const clientEmail = invoice.client?.email;
  if (!clientEmail) {
    throw new Error('Client email not found');
  }

  // Convert amount from string to number (in cents for Stripe)
  const amount = invoice.amount || '0';
  const amountInCents = Math.round(parseFloat(amount) * 100);

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice #${invoice.invoiceNumber}${invoice.project ? ` - ${invoice.project.name}` : ''}`,
            description: invoice.notes || undefined
          },
          unit_amount: amountInCents
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${origin}/invoice/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${ROOT_ROUTE}`,
    metadata: {
      invoiceId: invoice.id,
      projectId: invoice.projectId,
      userId: userId
    }
  });

  // Store the checkout session ID with the invoice
  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      stripeCheckoutId: session.id,
      stripeCheckoutUrl: session.url || ''
    }
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id
  };
}

export async function createConnectInvoiceCheckout(invoiceId: string, userId: string, stripeAccountId: string, origin: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      project: true,
      client: true
    }
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.userId !== userId) {
    throw new Error('Unauthorized access to invoice');
  }

  const clientEmail = invoice.client?.email;
  if (!clientEmail) {
    throw new Error('Client email not found');
  }

  // Convert amount from string to number (in cents for Stripe)
  const amount = invoice.amount || '0';
  const amountInCents = Math.round(parseFloat(amount) * 100);

  // Create Checkout Session for Stripe Connect
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice #${invoice.invoiceNumber}${invoice.project ? ` - ${invoice.project.name}` : ''}`,
            description: invoice.notes || undefined
          },
          unit_amount: amountInCents
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${origin}/invoice/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${ROOT_ROUTE}`,
    metadata: {
      invoiceId: invoice.id,
      projectId: invoice.projectId,
      userId: userId
    }
  }, {
    stripeAccount: stripeAccountId // This makes it a Connect checkout
  });

  // Store the checkout session ID with the invoice
  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      stripeCheckoutId: session.id,
      stripeCheckoutUrl: session.url || ''
    }
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id
  };
}