import { Analytics } from '@prisma/client';
import { db } from '../../prisma/client';
import { CreateUserMetrics } from './user/user-metrics';

export async function GetUserAnalytics(userId: string): Promise<Analytics> {
  const analytics = await db.analytics.findFirst({
    where: {
      userId: userId
    }
  });

  if (!analytics) {
    await CreateUserMetrics(userId);
    return await GetUserAnalytics(userId);
  }

  return analytics;
}
