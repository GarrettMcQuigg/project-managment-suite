import { PrismaClient } from '@prisma/client';
import { CalculateAverageResponseTime } from '../packages/lib/helpers/analytics/communication/calculate-avg-response-time';

// Initialize Prisma client
const prisma = new PrismaClient();

async function testResponseTimeCalculation() {
  try {
    // Get the first user in the database
    const firstUser = await prisma.user.findFirst({
      select: { id: true }
    });

    if (!firstUser) {
      // console.log('No users found in the database');
      return;
    }

    const userId = firstUser.id;
    // console.log(`Testing response time calculation for user ID: ${userId}`);

    // Get current analytics
    const beforeAnalytics = await prisma.analytics.findUnique({
      where: { userId },
      include: { communicationAnalytics: true }
    });

    // console.log('BEFORE calculation:');
    // console.log('- avgResponseTime:', beforeAnalytics?.communicationAnalytics?.avgResponseTime || 0);
    // console.log('- totalResponseTimeMinutes:', beforeAnalytics?.communicationAnalytics?.totalResponseTimeMinutes || 0);
    // console.log('- responseCount:', beforeAnalytics?.communicationAnalytics?.responseCount || 0);

    // Run the calculation
    // console.log('Running response time calculation...');
    await CalculateAverageResponseTime(userId);

    // Check updated analytics
    const afterAnalytics = await prisma.analytics.findUnique({
      where: { userId },
      include: { communicationAnalytics: true }
    });

    // console.log('\nAFTER calculation:');
    // console.log('- avgResponseTime:', afterAnalytics?.communicationAnalytics?.avgResponseTime || 0);
    // console.log('- totalResponseTimeMinutes:', afterAnalytics?.communicationAnalytics?.totalResponseTimeMinutes || 0);
    // console.log('- responseCount:', afterAnalytics?.communicationAnalytics?.responseCount || 0);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testResponseTimeCalculation().catch(console.error);

// npx ts-node -r tsconfig-paths/register --project tsconfig.json scripts/test-response-time.ts