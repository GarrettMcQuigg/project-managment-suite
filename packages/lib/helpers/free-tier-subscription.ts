import { db } from '@/packages/lib/prisma/client';
import { BillingCycle, SubscriptionStatus } from '@prisma/client';

export async function CreateFreeTierSubscription(userId: string): Promise<void> {
  try {
    const freeTierPlan = await db.subscriptionPlan.findFirst({
      where: {
        displayName: 'Beginner'
      }
    });

    if (!freeTierPlan) {
      return;
    }

    await db.subscription.create({
      data: {
        userId,
        tierId: freeTierPlan.id,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        billingCycle: BillingCycle.MONTHLY,
        nextBillingDate: new Date(),
        subscriptionHistory: {
          create: {
            planId: freeTierPlan.id,
            status: SubscriptionStatus.TRIALING,
            startDate: new Date()
          }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Failed to sign up for free tier:', error);
  }
}
