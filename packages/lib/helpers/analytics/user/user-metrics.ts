import { db } from '@/packages/lib/prisma/client';

export async function CreateUserMetrics(userId: string): Promise<void> {
  try {
    await db.analytics.create({
      data: {
        userId: userId,
        loginCount: 1,
        lastLogin: new Date()
      }
    });
  } catch (error: unknown) {
    console.error('Failed to create user metrics:', error);
  }
}

export async function UpdateUserMetrics(userId: string): Promise<void> {
  const userAnalytics = await db.analytics.findFirst({
    where: {
      userId: userId
    }
  });

  if (!userAnalytics) {
    await CreateUserMetrics(userId);
    return await UpdateUserMetrics(userId);
  }

  try {
    await db.analytics.update({
      where: {
        userId: userId
      },
      data: {
        loginCount: userAnalytics.loginCount + 1,
        lastLogin: new Date()
      }
    });
  } catch (error: unknown) {
    console.error('Failed to update user metrics:', error);
  }
}
