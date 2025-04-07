'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DASHBOARD_ROUTE } from '@/packages/lib/routes';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setMessage('Error: No session ID found');
      return;
    }

    fetch(`/api/stripe/process-success?session_id=${sessionId}`)
      .then((response) => {
        if (response.ok) {
          router.push(DASHBOARD_ROUTE);
        } else {
          setMessage('Error processing payment. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage('An unexpected error occurred');
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Payment Successful</h1>
        <p className="mt-4">{message}</p>
      </div>
    </div>
  );
}
