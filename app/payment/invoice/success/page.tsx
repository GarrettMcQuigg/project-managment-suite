'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) return;

      try {
        const response = await fetch('/api/payments/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        const data = await response.json();
        setPaymentInfo(data.content);
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>

      {loading ? (
        <p>Verifying payment...</p>
      ) : paymentInfo ? (
        <>
          <p className="mb-4">Thank you for your payment. Your invoice has been marked as paid.</p>
          <div className="bg-gray-50 p-4 rounded mb-6">
            <p>
              <strong>Invoice:</strong> #{paymentInfo.invoiceNumber}
            </p>
            <p>
              <strong>Amount Paid:</strong> ${paymentInfo.amount}
            </p>
            <p>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </>
      ) : (
        <p className="text-red-500">We couldn't verify your payment. Please wait a moment before trying again. If you were already been charged, please contact support.</p>
      )}
    </div>
  );
}
