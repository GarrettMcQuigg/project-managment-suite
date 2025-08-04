import { stripe } from '@packages/lib/stripe';
import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
import { db } from '@packages/lib/prisma/client';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';
import { StripeAccountStatus } from '@prisma/client';

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return handleUnauthorized();
    }

    if (!currentUser.stripeAccountId) {
      return handleSuccess({
        message: 'No Stripe account connected',
        content: { status: 'no_account' }
      });
    }

    if (currentUser.stripeAccountStatus !== StripeAccountStatus.PENDING) {
      return handleSuccess({
        message: 'Account already verified or not pending',
        content: {
          status: currentUser.stripeAccountStatus,
          no_update_needed: true
        }
      });
    }

    try {
      const account = await stripe.accounts.retrieve(currentUser.stripeAccountId);

      let newStatus: StripeAccountStatus;

      if (account.charges_enabled && account.payouts_enabled) {
        newStatus = StripeAccountStatus.VERIFIED;
      } else if (account.details_submitted && account.requirements?.currently_due?.length === 0) {
        newStatus = StripeAccountStatus.PENDING;
      } else {
        newStatus = StripeAccountStatus.PENDING;
      }

      if (currentUser.stripeAccountStatus !== newStatus) {
        await db.user.update({
          where: { id: currentUser.id },
          data: { stripeAccountStatus: newStatus }
        });

        return handleSuccess({
          message: 'Account status updated',
          content: {
            oldStatus: currentUser.stripeAccountStatus,
            newStatus: newStatus,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            updated: true
          }
        });
      } else {
        return handleSuccess({
          message: 'Account status unchanged',
          content: {
            status: newStatus,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            updated: false
          }
        });
      }
    } catch (error) {
      console.error(`Error syncing account for user ${currentUser.email}:`, error);
      return handleError({
        message: 'Failed to sync Stripe account',
        err: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    return handleError({
      message: 'Failed to sync Stripe account',
      err: error instanceof Error ? error.message : String(error)
    });
  }
}
