import { handleError, handleSuccess } from '@/packages/lib/helpers/api-response-handlers';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AUTH_SIGNUP_FROM_PRICING_ROUTE, PRICING_ROUTE } from '@/packages/lib/routes';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return handleSuccess({
        message: 'Authentication required',
        content: {
          requireAuth: true,
          authRoute: `${AUTH_SIGNUP_FROM_PRICING_ROUTE}`
        }
      });
    }

    const { priceId, planName } = await req.json();

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    if (!priceId || !planName) {
      return handleError({ message: 'Missing required parameters: priceId and planName are required' });
    }

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
      success_url: `${req.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}${PRICING_ROUTE}`,
      metadata: {
        userId: currentUser.id,
        planName
      }
    });

    return handleSuccess({ content: { sessionId: session.id } });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return handleError({
      message: 'Error creating checkout session',
      err
    });
  }
}
