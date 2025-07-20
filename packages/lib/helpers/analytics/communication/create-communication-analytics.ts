import { db } from "@/packages/lib/prisma/client";
import { CreateUserMetrics } from "../user/user-metrics";
import { it } from "node:test";

/**
 * Creates communication analytics for a user if they don't already exist
 * @param userId - The ID of the user
 */
export async function CreateCommunicationAnalytics(
  userId: string,
  iteration?: number
): Promise<void> {
  try {
    iteration = iteration || 0;

    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      },
      include: {
        communicationAnalytics: true
      }
    });

    if (!userAnalytics && iteration < 3) {
      iteration++;
      CreateUserMetrics(userId);
      return CreateCommunicationAnalytics(userId, iteration);
    }

    if (userAnalytics?.communicationAnalytics) {
      return;
    }

    if(userAnalytics) {
      await db.communicationAnalytics.create({
        data: {
          analyticsId: userAnalytics.id,
          messagesSent: 0,
          messagesReceived: 0,
          avgResponseTime: 0,
        }
      });
    }
  } catch (error: unknown) {
    console.error('Failed to create communication analytics:', error);
  }
}
