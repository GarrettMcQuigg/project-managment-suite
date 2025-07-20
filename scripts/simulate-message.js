// This is a simple script to simulate a message for testing response time tracking
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simulateMessage() {
  try {
    // Get the first user and client
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      // console.log('No users found in database');
      return;
    }

    const firstClient = await prisma.client.findFirst({
      where: { userId: firstUser.id }
    });
    if (!firstClient) {
      // console.log('No clients found for user');
      return;
    }

    // Get current analytics
    const beforeAnalytics = await prisma.analytics.findUnique({
      where: { userId: firstUser.id },
      include: { communicationAnalytics: true }
    });

    // console.log('Initial analytics state:');
    // console.log('- Messages Received:', beforeAnalytics?.communicationAnalytics?.messagesReceived || 0);
    // console.log('- Response Time (mins):', beforeAnalytics?.communicationAnalytics?.avgResponseTime || 0);
    // console.log('- Response Count:', beforeAnalytics?.communicationAnalytics?.responseCount || 0);
    // console.log('- Total Response Time (mins):', beforeAnalytics?.communicationAnalytics?.totalResponseTimeMinutes || 0);
    
    // Manually update the communication analytics with simulated response time data
    await prisma.communicationAnalytics.update({
      where: { id: beforeAnalytics.communicationAnalytics.id },
      data: {
        messagesReceived: { increment: 1 },
        responseCount: { increment: 1 },
        totalResponseTimeMinutes: { increment: 30 }, // Add 30 minutes response time
        avgResponseTime: Math.round(
          ((beforeAnalytics.communicationAnalytics.totalResponseTimeMinutes || 0) + 30) / 
          ((beforeAnalytics.communicationAnalytics.responseCount || 0) + 1)
        )
      }
    });
    
    // console.log('\nSimulated message received and updated response metrics');
    
    // Check updated analytics
    const afterAnalytics = await prisma.analytics.findUnique({
      where: { userId: firstUser.id },
      include: { communicationAnalytics: true }
    });
    
    // console.log('\nUpdated analytics state:');
    // console.log('- Messages Received:', afterAnalytics?.communicationAnalytics?.messagesReceived || 0);
    // console.log('- Response Time (mins):', afterAnalytics?.communicationAnalytics?.avgResponseTime || 0);
    // console.log('- Response Count:', afterAnalytics?.communicationAnalytics?.responseCount || 0);
    // console.log('- Total Response Time (mins):', afterAnalytics?.communicationAnalytics?.totalResponseTimeMinutes || 0);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateMessage()
  .then(() => console.log('Done'))
  .catch(console.error);
