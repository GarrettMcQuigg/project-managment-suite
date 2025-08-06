'use client';

import React, { useState } from 'react';
import { Link2, Loader2, X } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
import { Card } from '@/packages/lib/components/card';
import { useStripeAccount } from '@/packages/lib/hooks/use-stripe-account';
import { StripeAccountStatus } from '@prisma/client';

interface StripeConnectionCardProps {
  stripeAccountStatus: StripeAccountStatus;
}

export default function StripeConnectionCard({ stripeAccountStatus }: StripeConnectionCardProps) {
  console.log('stripeAccountStatus', stripeAccountStatus);
  const { isLoading, connectStripeAccount } = useStripeAccount();
  const [isHidden, setIsHidden] = useState(false);

  // Hide the card if account is verified or manually hidden
  if (stripeAccountStatus === StripeAccountStatus.VERIFIED || isHidden) {
    return null;
  }

  // Special case for PENDING status - no button, different message
  if (stripeAccountStatus === StripeAccountStatus.PENDING) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200 relative">
        <Button variant="ghost" size="icon" onClick={() => setIsHidden(true)} className="absolute top-2 right-2 h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-100">
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-3 pr-8">
          <Link2 className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Account Under Review</p>
            <p className="text-xs text-blue-700">Your information is currently being reviewed by our friends at Stripe. We'll update your account once you've been approved!</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200 relative">
      <Button variant="ghost" size="icon" onClick={() => setIsHidden(true)} className="absolute top-2 right-2 h-6 w-6 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100">
        <X className="h-4 w-4" />
      </Button>
      <div className="flex items-center justify-between pr-8">
        <div className="flex items-center space-x-3">
          <Link2 className="w-6 h-6 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Connect your Stripe account to create invoices</p>
            <p className="text-xs text-yellow-700">Set up payment processing to start billing clients</p>
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            connectStripeAccount();
          }}
          disabled={isLoading}
          variant="outline"
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Stripe'
          )}
        </Button>
      </div>
    </Card>
  );
}
