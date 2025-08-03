'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DASHBOARD_ROUTE } from '@/packages/lib/routes';

export default function StripeConnectSuccessPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Processing your Stripe account connection...');

  useEffect(() => {
    const processStripeSuccess = async () => {
      try {
        const syncResponse = await fetch('/api/stripe/sync-accounts', {
          method: 'POST',
          credentials: 'include'
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();

          if (syncData.content?.updated) {
            setMessage(`Stripe account ${syncData.content.newStatus.toLowerCase()}! Redirecting...`);
          } else {
            setMessage('Stripe account connected successfully! Redirecting...');
          }
        } else {
          setMessage('Stripe account connected! Redirecting...');
        }

        router.push(DASHBOARD_ROUTE);
      } catch (error) {
        console.error('Error processing Stripe success:', error);
        setMessage('Stripe account connected! Redirecting to dashboard...');
        router.push(DASHBOARD_ROUTE);
      }
    };

    processStripeSuccess();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Stripe Account Connected!</h1>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
