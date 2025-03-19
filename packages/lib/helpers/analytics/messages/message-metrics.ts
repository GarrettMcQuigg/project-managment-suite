import { db } from '@/packages/lib/prisma/client';
import { CreateUserMetrics } from '../user/user-metrics';

export default async function GetTotalClientMessages(userId: string): Promise<number> {
  try {
    const userAnalytics = await db.analytics.findFirst({
      where: {
        userId: userId
      }
    });

    if (!userAnalytics) {
      await CreateUserMetrics(userId);
      return await GetTotalClientMessages(userId);
    }

    const projectsWithMessages = await db.project.findMany({
      where: {
        userId: userId
      },
      include: {
        messages: true
      }
    });

    let totalMessages = 0;
    projectsWithMessages.forEach((project) => {
      const projectMessages = project.messages.length;
      totalMessages += projectMessages;
    });

    return totalMessages;
  } catch (error: unknown) {
    console.error('Failed to update user metrics:', error);
    return 0;
  }
}

// TODO : Add response rate
