import { useState, useEffect } from 'react';
import { API_STRIPE_CONNECT_ROUTE } from '../routes';

interface StripeAccountResponse {
  accountId?: string;
  status: 'NOT_CONNECTED' | 'PENDING' | 'VERIFIED' | 'RESTRICTED';
  accountLink?: string;
}

export function useStripeAccount() {
  const [stripeAccount, setStripeAccount] = useState<StripeAccountResponse>({
    status: 'NOT_CONNECTED'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const fetchStripeAccount = async () => {
    try {
      setIsLoading(true);
      setHasAttemptedFetch(true);
      const response = await fetch(API_STRIPE_CONNECT_ROUTE);

      if (!response.ok) {
        // Keep default NOT_CONNECTED status for failed requests
        return;
      }

      const data = await response.json();
      setStripeAccount(data.content);
    } catch (err) {
      setError('Failed to fetch Stripe account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectStripeAccount = async () => {
    try {
      setIsLoading(true);
      setHasAttemptedFetch(true);
      const response = await fetch(API_STRIPE_CONNECT_ROUTE);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.content && data.content.accountLink) {
        // New account created, redirect to onboarding
        window.location.href = data.content.accountLink;
      } else if (data.content && data.content.accountId && data.content.status) {
        // Existing account found, update local state
        setStripeAccount(data.content);
      } else {
        throw new Error('Invalid response from Stripe connection');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect Stripe account';
      setError(errorMessage);
      console.error('Stripe Account Connection Error:', {
        message: errorMessage,
        fullError: err
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stripeAccount,
    isLoading,
    error,
    connectStripeAccount,
    refetch: fetchStripeAccount,
    hasAttemptedFetch
  };
}
