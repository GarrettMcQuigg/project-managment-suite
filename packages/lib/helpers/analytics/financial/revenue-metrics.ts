import { db } from '@/packages/lib/prisma/client';
import { CreateUserMetrics } from '../user/user-metrics';
import { PaymentStatus } from '@prisma/client';

export async function GetTotalRevenue(userId: string): Promise<void> {
  const userAnalytics = await db.analytics.findFirst({
    where: {
      userId: userId
    }
  });

  if (!userAnalytics) {
    await CreateUserMetrics(userId);
    return await GetTotalRevenue(userId);
  }

  try {
    const invoices = await db.invoice.findMany({
      where: {
        userId: userId
      },
      include: {
        payments: {
          where: {
            status: PaymentStatus.COMPLETED
          }
        }
      }
    });

    let totalRevenue = 0;

    for (const invoice of invoices) {
      for (const payment of invoice.payments) {
        totalRevenue += Number(payment.amount);
      }
    }

    await db.analytics.update({
      where: {
        userId: userId
      },
      data: {
        totalRevenue
      }
    });
  } catch (error: unknown) {
    console.error('Failed to update finance metrics:', error);
  }
}

// TODO : Add Monthly Revenue
