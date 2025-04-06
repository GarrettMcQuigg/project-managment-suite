import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/packages/lib/prisma/client';
import { handleBadRequest, handleError } from '@/packages/lib/helpers/api-response-handlers';
import { SubscriptionStatus, BillingCycle, SubscriptionTierName } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// This disables body parsing to get the raw body
export const config = {
  api: {
    bodyParser: false
  }
};

async function getBodyContent(req: NextRequest): Promise<string> {
  const chunks = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of req.body as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// Map Stripe subscription status to your DB SubscriptionStatus
function mapStripeStatusToDbStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'unpaid':
      return SubscriptionStatus.UNPAID;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'paused':
      return SubscriptionStatus.PAUSED;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}

// Convert UI plan name to SubscriptionTierName enum value
function convertPlanNameToTierName(planName: string): SubscriptionTierName | null {
  switch (planName) {
    case 'Beginner':
      return SubscriptionTierName.INACTIVE;
    case 'Creator':
      return SubscriptionTierName.CREATOR;
    case 'Innovator':
      return SubscriptionTierName.INNOVATOR;
    case 'Visionary':
      return SubscriptionTierName.VISIONARY;
    default:
      console.error(`Unknown plan name: ${planName}`);
      return null;
  }
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return handleBadRequest({ message: 'Method not allowed' });
  }

  try {
    const body = await getBodyContent(req);
    const signature = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    if (!signature || !webhookSecret) {
      return handleError({ message: 'Missing signature or webhook secret' });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const planName = session.metadata?.planName;
        const billingCycle = session.metadata?.billingCycle === 'year' ? BillingCycle.ANNUALLY : BillingCycle.MONTHLY;

        if (userId && session.subscription && planName) {
          try {
            // Get subscription details from Stripe
            const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

            // Convert UI plan name to subscription tier name
            const subscriptionTierName = convertPlanNameToTierName(planName);

            if (!subscriptionTierName) {
              console.error(`Could not convert plan name '${planName}' to a subscription tier name`);
              break;
            }

            // Look up the subscription plan to get its ID
            const subscriptionPlan = await db.subscriptionPlan.findUnique({
              where: {
                name: subscriptionTierName
              }
            });

            if (!subscriptionPlan) {
              console.error(`Subscription plan ${subscriptionTierName} not found`);
              break;
            }

            // Get the start date from the subscription
            const startDate = new Date(stripeSubscription.created * 1000);

            // Get current period dates from the first subscription item
            let currentPeriodStart = startDate;
            let currentPeriodEnd = startDate;

            if (stripeSubscription.items?.data?.[0]) {
              const item = stripeSubscription.items.data[0];
              if (item.current_period_start) {
                currentPeriodStart = new Date(item.current_period_start * 1000);
              }
              if (item.current_period_end) {
                currentPeriodEnd = new Date(item.current_period_end * 1000);
              }
            }

            // Create or update user's subscription in your database
            await db.subscription.upsert({
              where: {
                userId
              },
              create: {
                userId,
                tierId: subscriptionPlan.id, // Use the plan's ID, not its name
                status: mapStripeStatusToDbStatus(stripeSubscription.status),
                currentPeriodStart,
                currentPeriodEnd,
                billingCycle,
                nextBillingDate: currentPeriodEnd,
                // Create initial subscription history record
                subscriptionHistory: {
                  create: {
                    planId: subscriptionPlan.id, // Use the plan's ID here too
                    status: mapStripeStatusToDbStatus(stripeSubscription.status),
                    startDate: currentPeriodStart
                  }
                }
              },
              update: {
                tierId: subscriptionPlan.id, // Use the plan's ID, not its name
                status: mapStripeStatusToDbStatus(stripeSubscription.status),
                currentPeriodStart,
                currentPeriodEnd,
                billingCycle,
                nextBillingDate: currentPeriodEnd,
                // Add new entry to subscription history
                subscriptionHistory: {
                  create: {
                    planId: subscriptionPlan.id, // Use the plan's ID here too
                    status: mapStripeStatusToDbStatus(stripeSubscription.status),
                    startDate: currentPeriodStart
                  }
                }
              }
            });
          } catch (error) {
            console.error('Error processing subscription:', error);
          }
        }
        break;
      }

      // For the customer.subscription.updated event case
      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const userId = stripeSubscription.metadata?.userId;

        if (!userId) {
          break;
        }

        try {
          // Get current subscription to update
          const currentSubscription = await db.subscription.findUnique({
            where: { userId }
          });

          if (!currentSubscription) {
            console.error(`No subscription found for user ${userId}`);
            break;
          }

          // Get current period dates from the first subscription item
          let currentPeriodStart = new Date(stripeSubscription.created * 1000);
          let currentPeriodEnd = currentPeriodStart;

          if (stripeSubscription.items?.data?.[0]) {
            const item = stripeSubscription.items.data[0];
            if (item.current_period_start) {
              currentPeriodStart = new Date(item.current_period_start * 1000);
            }
            if (item.current_period_end) {
              currentPeriodEnd = new Date(item.current_period_end * 1000);
            }
          }

          const newStatus = mapStripeStatusToDbStatus(stripeSubscription.status);

          // Update the subscription
          await db.subscription.update({
            where: { userId },
            data: {
              status: newStatus,
              currentPeriodStart,
              currentPeriodEnd,
              nextBillingDate: currentPeriodEnd,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
            }
          });

          // If status changed, add history record
          if (currentSubscription.status !== newStatus) {
            // Close previous history record
            await db.subscriptionHistory.updateMany({
              where: {
                subscriptionId: currentSubscription.id,
                endDate: null
              },
              data: {
                endDate: new Date()
              }
            });

            // Create new history record
            await db.subscriptionHistory.create({
              data: {
                subscriptionId: currentSubscription.id,
                planId: currentSubscription.tierId, // This already contains the plan ID
                status: newStatus,
                startDate: new Date()
              }
            });
          }
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscriptionId = (invoice as any).subscription;

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
            const userId = subscription.metadata?.userId;

            if (userId) {
              await db.subscription.update({
                where: { userId },
                data: {
                  status: SubscriptionStatus.PAST_DUE,
                  lastPaymentAttempt: new Date(),
                  failedPaymentCount: {
                    increment: 1
                  }
                }
              });
            }
          } catch (error) {
            console.error('Error handling failed payment:', error);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const userId = stripeSubscription.metadata?.userId;

        if (userId) {
          try {
            const subscription = await db.subscription.findUnique({
              where: { userId }
            });

            if (subscription) {
              // Update subscription status
              await db.subscription.update({
                where: { userId },
                data: {
                  status: SubscriptionStatus.CANCELED
                }
              });

              // Close current history entry
              await db.subscriptionHistory.updateMany({
                where: {
                  subscriptionId: subscription.id,
                  endDate: null
                },
                data: {
                  status: SubscriptionStatus.CANCELED,
                  endDate: new Date()
                }
              });
            }
          } catch (error) {
            console.error('Error handling subscription deletion:', error);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
