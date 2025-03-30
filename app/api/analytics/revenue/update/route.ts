import { handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { UpdateAllRevenueMetrics } from '@/packages/lib/helpers/analytics/financial/revenue-metrics';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';

export async function POST() {
  try {
    const context = await getSessionContext();

    if (context.type !== 'user' || !context.user) {
      return handleUnauthorized();
    }

    const userId = context.user.id;
    const revenueData = await UpdateAllRevenueMetrics(userId);

    return handleSuccess({
      content: revenueData
    });
  } catch (error) {
    return handleError({ message: 'Failed to update revenue metrics', err: error });
  }
}
