import { stripe } from '@packages/lib/stripe';
import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return handleUnauthorized();
    }

    // Check if Stripe is initialized
    if (!stripe) {
      return handleError({ message: 'Stripe configuration error' });
    }


    // Determine the base URL from the request
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // If user already has a Stripe account, return existing details
    if (currentUser.stripeAccountId) {
      try {
        const account = await stripe.accounts.retrieve(currentUser.stripeAccountId);
        
        return handleSuccess({ 
          message: 'Existing Stripe account found', 
          content: { 
            accountId: account.id, 
            status: account.details_submitted ? 'VERIFIED' : 'PENDING' 
          } 
        });
      } catch (stripeErr) {
        // TODO : Continue to create a new account
      }
    }

    // Create a new Stripe Express account
    let account;
    try {
      account = await stripe.accounts.create({
        type: 'express',
        email: currentUser.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });
    } catch (createError) {
      return handleError({ 
        message: 'Failed to create Stripe account', 
        err: String(createError) 
      });
    }

    // Update user with new Stripe account ID
    try {
      await db.user.update({
        where: { id: currentUser.id },
        data: { 
          stripeAccountId: account.id,
          stripeAccountStatus: 'PENDING'
        }
      });
    } catch (err) {
      // TODO : Don't return an error here, try to continue with account link creation
    }

    // Generate account link for onboarding
    let accountLink;
    try {
      accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${origin}/settings/payments`,
        return_url: `${origin}/settings/payments/success`,
        type: 'account_onboarding'
      });
    } catch (linkError) {
      return handleError({ 
        message: 'Failed to create Stripe onboarding link', 
        err: String(linkError) 
      });
    }

    // Return success response
    return handleSuccess({ 
      message: 'Stripe account created', 
      content: { 
        accountLink: accountLink.url,
        accountId: account.id,
        status: 'PENDING'
      } 
    });
  } catch (err: any) {
    return handleError({ 
      message: 'Failed to connect Stripe account. Please try again later.',
      err: err.message || String(err)
    });
  }
}