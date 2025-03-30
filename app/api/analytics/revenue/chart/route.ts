import { handleError, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { GetRevenueChartData } from '@/packages/lib/helpers/analytics/financial/revenue-metrics';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';

export async function GET() {
  try {
    const context = await getSessionContext();

    if (context.type !== 'user' || !context.user) {
      return handleUnauthorized();
    }

    const userId = context.user.id;
    const chartData = await GetRevenueChartData(userId);

    return handleSuccess({
      content: chartData
    });
  } catch (error) {
    return handleError({ message: 'Failed to fetch revenue chart data', err: error });
  }
}
