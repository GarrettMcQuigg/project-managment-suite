import { db } from '@/packages/lib/prisma/client';
import { CreateUserMetrics } from '../user/user-metrics';
import { getCurrentUser } from '../../get-current-user';

/**
 * Gets the total number of messages across all projects for a user
 */
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

/**
 * Calculate response rate for a user's projects
 * Response rate is the percentage of client messages that received a response
 */
export async function CalculateResponseRate(userId: string): Promise<number> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return 0;

  try {
    // Get all projects for this user
    const projects = await db.project.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        participants: true
      }
    });

    if (!projects.length) return 0;

    let clientMessages = 0;
    let respondedClientThreads = 0;
    let totalClientThreads = 0;

    for (const project of projects) {
      const ownerName = currentUser.firstname + ' ' + currentUser.lastname;
      const messages = project.messages;

      if (!messages.length) continue;

      let currentClientSender = null;
      let currentThreadResponded = false;
      let isTrackingClientThread = false;

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const isOwnerMessage = message.sender === ownerName;

        if (!isOwnerMessage) {
          clientMessages++;

          if (!isTrackingClientThread || currentClientSender !== message.sender) {
            if (isTrackingClientThread) {
              totalClientThreads++;
              if (currentThreadResponded) {
                respondedClientThreads++;
              }
            }

            currentClientSender = message.sender;
            currentThreadResponded = false;
            isTrackingClientThread = true;
          }
        } else if (isTrackingClientThread) {
          currentThreadResponded = true;

          const nextMessage = messages[i + 1];
          if (!nextMessage || nextMessage.sender !== currentClientSender) {
            totalClientThreads++;
            respondedClientThreads++;
            isTrackingClientThread = false;
          }
        }
      }

      if (isTrackingClientThread) {
        totalClientThreads++;
        if (currentThreadResponded) {
          respondedClientThreads++;
        }
      }
    }

    if (totalClientThreads === 0) return 0;

    const responseRate = Math.min((respondedClientThreads / totalClientThreads) * 100, 100);

    await db.analytics.update({
      where: { userId },
      data: { responseRate }
    });

    return responseRate;
  } catch (error) {
    console.error('Failed to calculate response rate:', error);
    return 0;
  }
}

// TODO : Do I even want this?
/**
 * Calculate average response time for a user's projects
 * Measures the average time between client messages and owner responses
 */
// export async function CalculateAverageResponseTime(userId: string): Promise<number> {
//   const currentUser = await getCurrentUser();
//   if (!currentUser) return 0;

//   try {
//     const projects = await db.project.findMany({
//       where: { userId },
//       include: {
//         messages: {
//           orderBy: { createdAt: 'asc' }
//         }
//       }
//     });

//     if (!projects.length) return 0;

//     let totalResponseTime = 0;
//     let responseCount = 0;

//     const ownerName = currentUser.firstname + ' ' + currentUser.lastname;

//     for (const project of projects) {
//       const messages = project.messages;

//       if (messages.length < 2) continue;

//       let lastClientMessageTime: Date | null = null;
//       let lastClientSender: string | null = null;

//       for (const message of messages) {
//         const isFromOwner = message.sender === ownerName;

//         if (isFromOwner && lastClientMessageTime && lastClientSender !== ownerName) {
//           const responseTime = Math.floor((new Date(message.createdAt).getTime() - new Date(lastClientMessageTime).getTime()) / (1000 * 60));

//           totalResponseTime += responseTime;
//           responseCount++;

//           lastClientMessageTime = null;
//         } else if (!isFromOwner) {
//           lastClientMessageTime = message.createdAt;
//           lastClientSender = message.sender;
//         }
//       }
//     }

//     const avgResponseTime = responseCount > 0 ? Math.floor(totalResponseTime / responseCount) : 0;

//     await db.analytics.update({
//       where: { userId },
//       data: { avgResponseTime }
//     });

//     return avgResponseTime;
//   } catch (error) {
//     console.error('Failed to calculate average response time:', error);
//     return 0;
//   }
// }

/**
 * Update all message metrics for a user
 */
export async function UpdateMessageMetrics(userId: string): Promise<void> {
  try {
    await CalculateResponseRate(userId);
    // await CalculateAverageResponseTime(userId);
  } catch (error) {
    console.error('Failed to update message metrics:', error);
  }
}
