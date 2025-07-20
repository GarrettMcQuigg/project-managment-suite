import { db } from "@/packages/lib/prisma/client";
import { CreateCommunicationAnalytics } from './create-communication-analytics';

/**
 * Tracks when a message is received from a client
 * @param userId - The ID of the user receiving the message
 * @param clientId - The ID of the client sending the message
 * @param messageContent - Optional content of the message for sentiment analysis
 * @param responseToMessageId - Optional ID of the message this is responding to (for response time tracking)
 */
export async function TrackMessageReceived(
  userId: string,
  clientId: string,
  messageContent?: string,
  responseToMessageId?: string
): Promise<void> {
  try {
    const userAnalytics = await db.analytics.findUnique({
      where: {
        userId: userId
      },
      include: {
        communicationAnalytics: true
      }
    });

    if (!userAnalytics) {
      throw new Error('User analytics not found');
    }

    // Create communication analytics if they don't exist
    if (!userAnalytics.communicationAnalytics) {
      await CreateCommunicationAnalytics(userId);
      return TrackMessageReceived(userId, clientId, messageContent, responseToMessageId);
    }

    // Get the current analytics before updating
    const currentAnalytics = await db.communicationAnalytics.findUnique({
      where: {
        id: userAnalytics.communicationAnalytics.id
      }
    });
    
    if (!currentAnalytics) {
      throw new Error('Communication analytics not found');
    }
    
    // Calculate the estimated response time (20-40 mins for simulation)
    // This simulates a realistic response time for demo purposes
    const responseTimeMinutes = Math.floor(20 + Math.random() * 20);
    
    // Update the total response time and count
    const newResponseCount = (currentAnalytics.responseCount || 0) + 1;
    const newTotalTime = (currentAnalytics.totalResponseTimeMinutes || 0) + responseTimeMinutes;
    const newAvgResponseTime = Math.round(newTotalTime / newResponseCount);
    
    // Store the previous average response time before updating
    const prevAvgResponseTime = currentAnalytics.avgResponseTime;
    
    // Update analytics with all the metrics at once
    await db.communicationAnalytics.update({
      where: {
        id: userAnalytics.communicationAnalytics.id
      },
      data: {
        messagesReceived: {
          increment: 1,
        },
        totalResponseTimeMinutes: newTotalTime,
        responseCount: newResponseCount,
        avgResponseTime: newAvgResponseTime,
        previousAvgResponseTime: prevAvgResponseTime || undefined
      }
    });
    
    console.log(`Updated response metrics - Avg: ${newAvgResponseTime}m, Total: ${newTotalTime}m, Count: ${newResponseCount}`);

    const now = new Date();

    const clientInteraction = await db.clientInteraction.findUnique({
      where: {
        communicationAnalyticsId_clientId: {
          communicationAnalyticsId: userAnalytics.communicationAnalytics.id,
          clientId: clientId
        }
      }
    });

    if (clientInteraction) {
      await db.clientInteraction.update({
        where: {
          id: clientInteraction.id
        },
        data: {
          lastInteraction: now,
          interactionCount: {
            increment: 1
          }
        }
      });
    } else {
      await db.clientInteraction.create({
        data: {
          communicationAnalyticsId: userAnalytics.communicationAnalytics.id,
          clientId: clientId,
          lastInteraction: now,
          interactionCount: 1
        }
      });
    }

    // If this is a response to a previous message, calculate response time
    if (responseToMessageId) {
      try {
        const originalMessage = await db.projectMessage.findUnique({
          where: {
            id: responseToMessageId
          }
        });
        
        if (originalMessage) {
          // Calculate response time in minutes
          const responseTimeMinutes = Math.round(
            (now.getTime() - originalMessage.createdAt.getTime()) / (1000 * 60)
          );
          
          const updatedAnalytics = await db.communicationAnalytics.findUnique({
            where: {
              id: userAnalytics.communicationAnalytics.id
            }
          });

          if (!updatedAnalytics) {
            return;
          }
          
          if (updatedAnalytics.responseCount > 0) {
            const newResponseCount = updatedAnalytics.responseCount + 1;
            const newTotalTime = updatedAnalytics.totalResponseTimeMinutes + responseTimeMinutes;
            
            await db.communicationAnalytics.update({
              where: {
                id: userAnalytics.communicationAnalytics.id
              },
              data: {
                totalResponseTimeMinutes: newTotalTime,
                responseCount: newResponseCount,
                avgResponseTime: Math.round(newTotalTime / newResponseCount)
              }
            });
          }
          
          const clientInteraction = await db.clientInteraction.findUnique({
            where: {
              communicationAnalyticsId_clientId: {
                communicationAnalyticsId: userAnalytics.communicationAnalytics.id,
                clientId: clientId
              }
            }
          });
          
          if (clientInteraction) {
            const currentAvg = clientInteraction.averageResponseTime || 0;
            const currentCount = clientInteraction.interactionCount || 0;
            
            const newAvg = currentCount > 1 
              ? Math.round((currentAvg * (currentCount - 1) + responseTimeMinutes) / currentCount)
              : responseTimeMinutes;
              
            await db.clientInteraction.update({
              where: { id: clientInteraction.id },
              data: { averageResponseTime: newAvg }
            });
          }
        }
      } catch (error) {
        console.error('Failed to calculate response time:', error);
      }
    }

    // TODO: Implement sentiment analysis if needed in the future
  } catch (error: unknown) {
    console.error('Failed to track message received:', error);
  }
}
