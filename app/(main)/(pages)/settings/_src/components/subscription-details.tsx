'use client';

import { CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { BillingHistory } from './billing-history';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/packages/lib/components/card';
import { Separator } from '@radix-ui/react-select';
import { PlanFeaturesList } from './plan-features';
import { Button } from '@/packages/lib/components/button';
import { SubscriptionStatusBadge } from './subscription-status-bar';
import { SubscriptionStatus } from '@prisma/client';

async function getSubscription() {
  return {
    id: 'sub_123456',
    status: SubscriptionStatus.ACTIVE,
    tier: {
      id: 'plan_visionary',
      name: 'VISIONARY',
      displayName: 'Visionary Plan',
      monthlyPrice: 49.99,
      annualPrice: 499.99,
      currency: 'USD',
      projectLimit: 50,
      storageLimit: 100000,
      clientLimit: 100,
      teamMemberLimit: 10,
      features: [
        { id: 'feat_1', name: 'Unlimited Projects', description: 'Create as many projects as you need' },
        { id: 'feat_2', name: 'Advanced Analytics', description: 'Get detailed insights into your business' },
        { id: 'feat_3', name: 'Priority Support', description: 'Get help when you need it most' },
        { id: 'feat_4', name: 'Custom Branding', description: 'Add your own logo and colors' },
        { id: 'feat_5', name: 'API Access', description: 'Integrate with your favorite tools' }
      ]
    },
    billingCycle: 'MONTHLY',
    currentPeriodStart: new Date('2023-01-01'),
    currentPeriodEnd: new Date('2023-02-01'),
    nextBillingDate: new Date('2023-02-01'),
    cancelAtPeriodEnd: false
  };
}

export default async function SubscriptionDetails() {
  const subscription = await getSubscription();

  const isActive = subscription.status === SubscriptionStatus.ACTIVE;
  const isCanceled = subscription.cancelAtPeriodEnd;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{subscription.tier.displayName}</CardTitle>
              <CardDescription>Your current subscription plan</CardDescription>
            </div>
            <SubscriptionStatusBadge status={subscription.status} cancelAtPeriodEnd={subscription.cancelAtPeriodEnd} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-medium">Billing Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{subscription.billingCycle === 'MONTHLY' ? 'Monthly' : 'Annual'} billing</span>
                  <span className="ml-auto font-medium">
                    {subscription.tier.currency} {subscription.billingCycle === 'MONTHLY' ? subscription.tier.monthlyPrice : subscription.tier.annualPrice}/
                    {subscription.billingCycle === 'MONTHLY' ? 'month' : 'year'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Current period</span>
                  <span className="ml-auto">
                    {subscription.currentPeriodStart.toLocaleDateString('en-US')} - {subscription.currentPeriodEnd.toLocaleDateString('en-US')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Next billing date</span>
                  <span className="ml-auto">{subscription.nextBillingDate.toLocaleDateString('en-US')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Plan Limits</h3>
              <div className="space-y-2">
                {subscription.tier.projectLimit && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Projects</span>
                    <span className="font-medium">{subscription.tier.projectLimit}</span>
                  </div>
                )}
                {subscription.tier.storageLimit && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Storage</span>
                    <span className="font-medium">{subscription.tier.storageLimit} MB</span>
                  </div>
                )}
                {subscription.tier.clientLimit && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Clients</span>
                    <span className="font-medium">{subscription.tier.clientLimit}</span>
                  </div>
                )}
                {subscription.tier.teamMemberLimit && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Team Members</span>
                    <span className="font-medium">{subscription.tier.teamMemberLimit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Plan Features</h3>
            <PlanFeaturesList features={subscription.tier.features} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
          {isActive && !isCanceled ? (
            <>
              <Button variant="outline">Change Plan</Button>
              <Button variant="destructive">Cancel Subscription</Button>
            </>
          ) : isCanceled ? (
            <>
              <div className="text-sm text-muted-foreground">Your subscription will end on {subscription.currentPeriodEnd.toLocaleDateString('en-US')}</div>
              <Button>Resume Subscription</Button>
            </>
          ) : (
            <Button>Reactivate Subscription</Button>
          )}
        </CardFooter>
      </Card>

      <BillingHistory />
    </div>
  );
}
