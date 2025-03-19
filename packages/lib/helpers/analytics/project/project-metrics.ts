import { db } from '@/packages/lib/prisma/client';
import { CreateUserMetrics } from '../user/user-metrics';

export async function UpdateProjectMetrics(userId: string): Promise<void> {
  const projectAnalytics = await db.analytics.findFirst({
    where: {
      userId: userId
    }
  });

  if (!projectAnalytics) {
    await CreateUserMetrics(userId);
    return await UpdateProjectMetrics(userId);
  }

  try {
    const projectCount = await db.project.count({
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
        projectsCreated: projectCount
      }
    });
  } catch (error: unknown) {
    console.error('Failed to update user metrics:', error);
  }
}
