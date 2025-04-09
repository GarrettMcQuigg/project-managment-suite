'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/packages/lib/components/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/packages/lib/components/card';
import { Check } from 'lucide-react';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { API_AUTH_SUBSCRIPTION_ROUTE, API_STRIPE_CHECKOUT_ROUTE, AUTH_SIGNUP_ROUTE, DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { toast } from 'react-toastify';
import { UserWithMetadata } from '@/packages/lib/prisma/types';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

// TODO : Don't love storing id's like this. Need to change them each time... ew. May have to call db to get them
const tiers = [
  {
    name: 'Beginner',
    id: '47bedb8d-0629-4420-b040-5866a776529e',
    price: 'Free',
    description: 'Perfect for getting started',
    features: ['Create up to 2 projects', 'Basic task management', 'Simple client communication'],
    priceId: null // No Stripe price ID for free tier
  },
  {
    name: 'Creator',
    price: '$19.99',
    id: 'c00dc490-55fa-4a73-9551-68cf31c901cf',
    description: 'Ideal for growing creatives',
    features: ['Create up to 10 projects', 'Advanced task management', 'Enhanced client communication', 'Basic analytics', 'File sharing up to 5GB'],
    priceId: 'price_1RAbGAPRJugMRQ0g7Zz1nc5K'
  },
  {
    name: 'Innovator',
    price: '$49.99',
    id: 'fa89af33-fe5e-494b-a217-eece2b906a86',
    description: 'For established creative professionals',
    features: ['Unlimited projects', 'Advanced analytics', 'Team collaboration tools', 'Custom branding', 'File sharing up to 50GB', 'Priority support'],
    priceId: 'price_1RAbGRPRJugMRQ0gO9pfqXu4'
  },
  {
    name: 'Visionary',
    price: '$99.99',
    id: '47a892e6-2067-44e5-872d-1139d624576c',
    description: 'For creative agencies and large teams',
    features: ['All Innovator features', 'Unlimited file sharing', 'Advanced team management', 'API access', 'Dedicated account manager', 'Custom integrations'],
    priceId: 'price_1RAbGfPRJugMRQ0gB62ByWwk'
  }
];

interface PricingComponentProps {
  currentUser: UserWithMetadata | null;
}

export default function PricingComponent({ currentUser }: PricingComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubscription = async (priceId: string | null, planName: string) => {
    if (!priceId) return handleFreeTier(); // Handle free tier differently

    setIsLoading(true);

    try {
      const response = await fetcher({
        url: API_STRIPE_CHECKOUT_ROUTE,
        requestBody: {
          priceId,
          planName
        },
        method: HttpMethods.POST
      });

      if (response.content?.requireAuth) {
        window.location.href = `${AUTH_SIGNUP_ROUTE}?from=pricing`;
        return;
      }

      if (response.err) {
        toast.error(response.message || 'Failed to create checkout session');
        setIsLoading(false);
        return;
      }

      // Redirect to checkout
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error('Stripe failed to load');
        setIsLoading(false);
        return;
      }

      const sessionId = response.content.sessionId;

      if (!sessionId) {
        toast.error('No session ID returned from server');
        setIsLoading(false);
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        toast.error('Error redirecting to checkout');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeTier = async () => {
    // Why is next forcing me to check currentUser.subscription twice... stupid...
    if (currentUser && currentUser.subscription) {
      tiers.find((tier) => currentUser.subscription && tier.id === currentUser.subscription.id);
      toast.error('You already have this subscription');
      return;
    }
    try {
      const response = await fetcher({ url: API_AUTH_SUBSCRIPTION_ROUTE });

      if (response.err) {
        toast.error(response.message || 'Failed to create subscription');
        return;
      } else {
        toast.success(response.content || 'Welcome Home!');
        router.push(DASHBOARD_ROUTE);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Pricing Plans</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose the perfect plan for your creative journey - No hidden fees, ever.</p>
      </div>

      <div className="mt-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => (
            <Card key={tier.name} className={`flex h-full flex-col ${index === 2 ? 'relative border-primary shadow-lg' : ''}`}>
              {index === 2 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">Most Popular</div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-3xl font-bold">{tier.price}</div>
                <div className="text-sm text-muted-foreground">per month</div>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={index === 2 ? 'default' : 'outline'} disabled={isLoading} onClick={() => handleSubscription(tier.priceId, tier.name)}>
                  {isLoading ? 'Loading...' : index === 0 ? 'Get Started' : 'Subscribe'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
