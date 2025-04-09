import { handleError, handleSuccess } from '@/packages/lib/helpers/api-response-handlers';
import { CreateFreeTierSubscription } from '@/packages/lib/helpers/free-tier-subscription';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { unauthorized } from 'next/navigation';

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorized();
    }

    if (currentUser.subscription) {
      // TODO : Handle when a user tries to go from a paid tier to a free tier
      // They may have over the limit of storage and total projects/clients
      // Need to warn them that downgrading from a paid tier to a free tier will result in loss of data
      // (MAYBE, lowkey sounds like extortion lol) and that they will need to upgrade to a paid tier to get their data back
      return;
    }

    await CreateFreeTierSubscription(currentUser.id);

    return handleSuccess({ content: 'Welcome Home!' });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return handleError({
      message: 'Error creating checkout session',
      err
    });
  }
}
