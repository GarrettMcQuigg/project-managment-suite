import { db } from '@/packages/lib/prisma/client';
import { CreateUserMetrics } from '../user/user-metrics';
import { PaymentStatus } from '@prisma/client';

export async function GetTotalRevenue(userId: string): Promise<number> {
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

    return totalRevenue;
  } catch (error: unknown) {
    console.error('Failed to update finance metrics:', error);
    return 0;
  }
}

/**
 * Calculate and update monthly revenue records for a user
 */
export async function UpdateMonthlyRevenue(userId: string): Promise<void> {
  try {
    const userAnalytics = await db.analytics.findFirst({
      where: { userId }
    });

    if (!userAnalytics) {
      await CreateUserMetrics(userId);
      return await UpdateMonthlyRevenue(userId);
    }

    // Get completed payments
    const completedPayments = await db.payment.findMany({
      where: {
        invoice: {
          userId
        },
        status: PaymentStatus.COMPLETED,
        paidAt: { not: null }
      },
      select: {
        amount: true,
        paidAt: true
      },
      orderBy: {
        paidAt: 'asc'
      }
    });

    // Group payments by month
    const monthlyPayments = new Map<string, number>();

    completedPayments.forEach((payment) => {
      if (!payment.paidAt) return;

      // Create a key for the month (YYYY-MM)
      const paidAt = new Date(payment.paidAt);
      const monthKey = `${paidAt.getFullYear()}-${String(paidAt.getMonth() + 1).padStart(2, '0')}`;

      // Get the first day of the month for database storage
      const monthDate = new Date(paidAt.getFullYear(), paidAt.getMonth(), 1);

      // Add to the monthly total
      const currentAmount = monthlyPayments.get(monthKey) || 0;
      monthlyPayments.set(monthKey, currentAmount + Number(payment.amount));
    });

    // Get existing monthly revenue records
    const existingRecords = await db.monthlyRevenue.findMany({
      where: { analyticsId: userAnalytics.id }
    });

    // Create a map of existing records by month
    const existingRecordsByMonth = new Map();
    existingRecords.forEach((record) => {
      const month = record.month;
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      existingRecordsByMonth.set(monthKey, record);
    });

    // Process each month's revenue
    const months = Array.from(monthlyPayments.keys()).sort();

    for (let i = 0; i < months.length; i++) {
      const monthKey = months[i];
      const amount = monthlyPayments.get(monthKey) || 0;

      // Calculate year and month from key
      const [year, month] = monthKey.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);

      // Calculate growth if we have a previous month
      let growth = null;
      if (i > 0) {
        const prevMonthKey = months[i - 1];
        const prevAmount = monthlyPayments.get(prevMonthKey) || 0;

        if (prevAmount > 0) {
          // Calculate percentage growth
          growth = ((amount - prevAmount) / prevAmount) * 100;
        }
      }

      // Update or create monthly revenue record
      const existingRecord = existingRecordsByMonth.get(monthKey);

      if (existingRecord) {
        // Update existing record
        await db.monthlyRevenue.update({
          where: { id: existingRecord.id },
          data: {
            amount,
            growth
          }
        });
      } else {
        // Create new record
        await db.monthlyRevenue.create({
          data: {
            analyticsId: userAnalytics.id,
            month: monthDate,
            amount,
            growth
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to update monthly revenue:', error);
  }
}

/**
 * Get current month's revenue and growth
 */
export async function GetCurrentMonthRevenue(userId: string): Promise<{
  currentMonthRevenue: number;
  growth: number | null;
  formattedRevenue: string;
  formattedGrowth: string;
}> {
  try {
    // First ensure monthly revenue data is updated
    await UpdateMonthlyRevenue(userId);

    const userAnalytics = await db.analytics.findFirst({
      where: { userId },
      include: {
        monthlyRevenue: {
          orderBy: { month: 'desc' },
          take: 1
        }
      }
    });

    if (!userAnalytics || !userAnalytics.monthlyRevenue.length) {
      return {
        currentMonthRevenue: 0,
        growth: null,
        formattedRevenue: '$0.00',
        formattedGrowth: '0%'
      };
    }

    const latestMonth = userAnalytics.monthlyRevenue[0];
    const currentMonthRevenue = Number(latestMonth.amount);
    const growth = latestMonth.growth ? Number(latestMonth.growth) : null;

    // Format for display
    const formattedRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(currentMonthRevenue);

    const formattedGrowth = growth !== null ? `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%` : '0%';

    return {
      currentMonthRevenue,
      growth,
      formattedRevenue,
      formattedGrowth
    };
  } catch (error) {
    console.error('Failed to get current month revenue:', error);
    return {
      currentMonthRevenue: 0,
      growth: null,
      formattedRevenue: '$0.00',
      formattedGrowth: '0%'
    };
  }
}

/**
 * Get monthly revenue data for charts
 */
export async function GetRevenueChartData(userId: string): Promise<Array<{ month: string; revenue: number }>> {
  try {
    // Ensure data is updated first
    await UpdateMonthlyRevenue(userId);

    const userAnalytics = await db.analytics.findFirst({
      where: { userId },
      include: {
        monthlyRevenue: {
          orderBy: { month: 'asc' },
          take: 12
        }
      }
    });

    if (!userAnalytics || !userAnalytics.monthlyRevenue.length) {
      return [];
    }

    // Get the last 12 months (or all available months if less than 12)
    const revenueData = userAnalytics.monthlyRevenue
      .slice(-12) // Take the last 12 months
      .map((record) => {
        const date = new Date(record.month);
        const month = date.toLocaleString('en-US', { month: 'short' });
        return {
          month,
          revenue: Number(record.amount)
        };
      });

    return revenueData;
  } catch (error) {
    console.error('Failed to get revenue chart data:', error);
    return [];
  }
}

/**
 * Update all revenue metrics at once
 */
export async function UpdateAllRevenueMetrics(userId: string): Promise<{
  totalRevenue: number;
  currentMonthData: {
    currentMonthRevenue: number;
    growth: number | null;
    formattedRevenue: string;
    formattedGrowth: string;
  };
  chartData: Array<{ month: string; revenue: number }>;
}> {
  const totalRevenue = await GetTotalRevenue(userId);
  await UpdateMonthlyRevenue(userId);
  const currentMonthData = await GetCurrentMonthRevenue(userId);
  const chartData = await GetRevenueChartData(userId);

  return {
    totalRevenue,
    currentMonthData,
    chartData
  };
}
