import { NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { CalculateAverageResponseTime, CreateCommunicationAnalytics } from '@/packages/lib/helpers/analytics/communication';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return handleUnauthorized();
    }

    if (!currentUser.analytics?.communicationAnalytics) {
      await CreateCommunicationAnalytics(currentUser.id);
    }

    // Ensure we have the latest average response time calculated
    await CalculateAverageResponseTime(currentUser.id);

    // Fetch the updated analytics
    const userWithAnalytics = await db.user.findUnique({
      where: { id: currentUser.id },
      include: {
        analytics: {
          include: {
            communicationAnalytics: true
          }
        }
      }
    });

    // Get the average response time
    const avgResponseTime = userWithAnalytics?.analytics?.communicationAnalytics?.avgResponseTime || 0;
    // const responseTimeChange = userWithAnalytics?.analytics?.communicationAnalytics?.responseTimeChange || 0;
    
    return NextResponse.json({
      avgResponseTime,
      // responseTimeChange,
    });
  } catch (error) {
    console.error('Error fetching communication analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
