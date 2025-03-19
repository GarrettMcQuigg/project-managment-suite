import { db } from '@/packages/lib/prisma/client';
import { CreateUserMetrics } from '../user/user-metrics';

export async function UpdateClientMetrics(userId: string): Promise<void> {
  const clientAnalytics = await db.analytics.findFirst({
    where: {
      userId: userId
    }
  });

  if (!clientAnalytics) {
    await CreateUserMetrics(userId);
    return await UpdateClientMetrics(userId);
  }

  try {
    // TODO : Add ClientEngagementMetrics

    const clientCount = await db.client.count({
      where: {
        userId: userId,
        AND: {
          deletedAt: null
        }
      }
    });

    await db.analytics.update({
      where: {
        userId: userId
      },
      data: {
        activeClients: clientCount
      }
    });
  } catch (error: unknown) {
    console.error('Failed to update user metrics:', error);
  }
}
