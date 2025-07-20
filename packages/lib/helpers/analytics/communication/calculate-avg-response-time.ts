import { db } from "@/packages/lib/prisma/client";

/**
 * Calculates and updates the average response time for a user's communication analytics
 * This function analyzes project messages to identify user response patterns
 * @param userId - The ID of the user to calculate average response time for
 */
export async function CalculateAverageResponseTime(userId: string): Promise<void> {
  try {
    const userAnalytics = await db.analytics.findUnique({
      where: { userId },
      include: { communicationAnalytics: true }
    });

    if (!userAnalytics?.communicationAnalytics) {
      console.error('Communication analytics not found for user:', userId);
      return;
    }

    const userProjects = await db.project.findMany({
      where: { userId },
      include: { client: true }
    });
    
    if (!userProjects.length) {
      return; // No projects to analyze
    }
    
    let totalResponseTimeMinutes = 0;
    let responseCount = 0;
    
    for (const project of userProjects) {
      const projectMessages = await db.projectMessage.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: 'asc' }
      });
      
      if (projectMessages.length < 2) {
        continue; // Need at least 2 messages for a response
      }
      
      let lastClientMessage: Date | null = null;
      let lastUserMessage: Date | null = null;
      
      for (const message of projectMessages) {
        let isUserMessage = false;
        
        if (message.sender) {
          if (message.sender.toLowerCase().includes('portal')) {
            isUserMessage = false;
          } else if (message.sender.includes(' ')) {
            isUserMessage = true;
          }
        }
        
        if (isUserMessage) {
          if (lastClientMessage) {
            const responseTimeMinutes = Math.round(
              (message.createdAt.getTime() - lastClientMessage.getTime()) / (1000 * 60)
            );
            
            if (responseTimeMinutes > 0) {
              totalResponseTimeMinutes += responseTimeMinutes;
              responseCount++;
            }
          }
          
          lastUserMessage = message.createdAt;
        } else {
          lastClientMessage = message.createdAt;
        }
      }
    }
    
    if (responseCount > 0) {
      const avgResponseTime = Math.round(totalResponseTimeMinutes / responseCount);
      
      const previousAvgResponseTime = userAnalytics.communicationAnalytics.avgResponseTime;
      
      await db.communicationAnalytics.update({
        where: { id: userAnalytics.communicationAnalytics.id },
        data: {
          totalResponseTimeMinutes,
          responseCount,
          avgResponseTime,
          previousAvgResponseTime: previousAvgResponseTime || undefined
        }
      });
      
    } else {
      if (userAnalytics.communicationAnalytics.avgResponseTime === 0 || 
          userAnalytics.communicationAnalytics.avgResponseTime === null) {
        await db.communicationAnalytics.update({
          where: { id: userAnalytics.communicationAnalytics.id },
          data: {
            totalResponseTimeMinutes: 30, 
            responseCount: 1,
            avgResponseTime: 30
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to calculate average response time:', error);
  }
}
