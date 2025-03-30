import { handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { GetCurrentMonthRevenue } from '@/packages/lib/helpers/analytics/financial/revenue-metrics';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';

export async function GET() {
  try {
    const context = await getSessionContext();

    if (context.type !== 'user' || !context.user) {
      return handleUnauthorized();
    }

    const userId = context.user.id;
    const currentMonthData = await GetCurrentMonthRevenue(userId);

    return handleSuccess({
      content: currentMonthData
    });
  } catch (error) {
    return handleError({ message: 'Failed to fetch current month revenue', err: error });
  }
}
