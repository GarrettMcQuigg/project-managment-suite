import { useState, useEffect } from 'react';

interface StripeAccountResponse {
  accountId?: string;
  status: 'NOT_CONNECTED' | 'PENDING' | 'VERIFIED' | 'RESTRICTED';
  accountLink?: string;
}

export function useStripeAccount() {
  const [stripeAccount, setStripeAccount] = useState<StripeAccountResponse>({
    status: 'NOT_CONNECTED'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStripeAccount = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/connect');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
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
      const response = await fetch('/api/stripe/connect');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.content.accountLink) {
        window.location.href = data.content.accountLink;
      } else {
        throw new Error('No account link received');
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

  useEffect(() => {
    fetchStripeAccount();
  }, []);

  return {
    stripeAccount,
    isLoading,
    error,
    connectStripeAccount,
    refetch: fetchStripeAccount
  };
}