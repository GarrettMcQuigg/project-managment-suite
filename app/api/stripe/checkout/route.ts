import { handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { DASHBOARD_ROUTE, PRICING_ROUTE } from '@/packages/lib/routes';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

// TODO : implement environment variables for Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    // TODO : Need to make sure the user has an ccount before reaching this route
    // I want the !currentUser -> unauth error, but need to make sure it doesn't get tripped by the user not being logged in
    // or the user gets stuck trying to sign up, and can't get to the checkout page
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return handleUnauthorized();
    }

    const { priceId, planName } = await req.json();

    // Create Checkout Sessions from body params
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: currentUser.email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      // Redirect URLs
      success_url: `${req.nextUrl.origin}${DASHBOARD_ROUTE}`,
      cancel_url: `${req.nextUrl.origin}${PRICING_ROUTE}`,
      metadata: {
        userId: currentUser.id,
        planName
      }
    });

    return handleSuccess({ content: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return handleError({ message: 'Error creating checkout session' });
  }
}
