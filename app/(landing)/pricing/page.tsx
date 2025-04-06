'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/packages/lib/components/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/packages/lib/components/card';
import SubtleBackground from '@/packages/lib/components/subtle-background';
import { Check } from 'lucide-react';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { HttpMethods } from '@/packages/lib/constants/http-methods';
import { API_STRIPE_CHECKOUT_ROUTE } from '@/packages/lib/routes';
import { toast } from 'react-toastify';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const tiers = [
  {
    name: 'Beginner',
    price: 'Free',
    description: 'Perfect for getting started',
    features: ['Create up to 2 projects', 'Basic task management', 'Simple client communication'],
    priceId: null // No Stripe price ID for free tier
  },
  {
    name: 'Creator',
    price: '$19.99',
    description: 'Ideal for growing creatives',
    features: ['Create up to 10 projects', 'Advanced task management', 'Enhanced client communication', 'Basic analytics', 'File sharing up to 5GB'],
    priceId: 'price_1RAbGAPRJugMRQ0g7Zz1nc5K'
  },
  {
    name: 'Innovator',
    price: '$49.99',
    description: 'For established creative professionals',
    features: ['Unlimited projects', 'Advanced analytics', 'Team collaboration tools', 'Custom branding', 'File sharing up to 50GB', 'Priority support'],
    priceId: 'price_1RAbGRPRJugMRQ0gO9pfqXu4'
  },
  {
    name: 'Visionary',
    price: '$99.99',
    description: 'For creative agencies and large teams',
    features: ['All Innovator features', 'Unlimited file sharing', 'Advanced team management', 'API access', 'Dedicated account manager', 'Custom integrations'],
    priceId: 'price_1RAbGfPRJugMRQ0gB62ByWwk'
  }
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscription = async (priceId: string | null, planName: string) => {
    if (!priceId) return handleFreeTier(); // Handle free tier differently

    setIsLoading(true);

    try {
      // Create checkout session using your custom fetcher
      const response = await fetcher({
        url: API_STRIPE_CHECKOUT_ROUTE,
        requestBody: {
          priceId,
          planName
        },
        method: HttpMethods.POST
      });

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

      const sessionId = response.content;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Error redirecting to checkout:', error);
        toast.error('Error redirecting to checkout');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeTier = () => {
    console.log('oh baby we got a cheap skate over here!');
    toast.info('You selected the Free plan!');
    // Logic for handling the free tier subscription
  };

  return (
    <div className="min-h-screen min-w-full overflow-x-hidden">
      <SubtleBackground />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-12">
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
    </div>
  );
}
