import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return handleUnauthorized();
    }

    return handleSuccess({
      message: 'Stripe status retrieved',
      content: {
        status: currentUser.stripeAccountStatus
      }
    });
  } catch (error) {
    return handleError({
      message: 'Failed to get Stripe status',
      err: error instanceof Error ? error.message : String(error)
    });
  }
}
