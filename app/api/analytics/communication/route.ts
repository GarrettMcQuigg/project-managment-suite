import { NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { CalculateAverageResponseTime, CreateCommunicationAnalytics } from '@/packages/lib/helpers/analytics/communication';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { serializePrismaModel } from '@/packages/lib/helpers/serialization';

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

    // Serialize the data to handle Decimal types
    const serializedAnalytics = serializePrismaModel(userWithAnalytics?.analytics);
    
    // Get the response time metrics
    const analytics = serializedAnalytics?.communicationAnalytics;
    const avgResponseTime = analytics?.avgResponseTime || 0;
    const previousAvgResponseTime = analytics?.previousAvgResponseTime || 0;
    
    // Calculate the response time change percentage
    let responseTimeChange = 0;
    
    if (previousAvgResponseTime > 0 && avgResponseTime > 0) {
      // Calculate percentage change (negative means faster responses - which is good)
      responseTimeChange = Math.round(((avgResponseTime - previousAvgResponseTime) / previousAvgResponseTime) * 100);
      
      // For UI display, invert the sign so positive means improvement
      responseTimeChange = responseTimeChange * -1;
    }
    
    return NextResponse.json({
      avgResponseTime,
      previousAvgResponseTime,
      responseTimeChange,
      messagesSent: analytics?.messagesSent || 0,
      messagesReceived: analytics?.messagesReceived || 0
    });
  } catch (error) {
    console.error('Error fetching communication analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
