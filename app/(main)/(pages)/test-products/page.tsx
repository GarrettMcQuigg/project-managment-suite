'use client';

import React from 'react';
import { Button } from '@/packages/lib/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Input } from '@/packages/lib/components/input';
import { Label } from '@/packages/lib/components/label';
import { ORDER_CONFIRMATION_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

const products = [
  {
    id: 'prod_001',
    name: 'Premium Analytics Package',
    description: 'Advanced attribution analytics with AI-powered insights and unlimited reporting.',
    price: 199.99,
    image: '📊'
  },
  {
    id: 'prod_002',
    name: 'Enterprise Tracking Suite',
    description: 'Complete tracking solution with multi-channel attribution and custom integrations.',
    price: 499.99,
    image: '🎯'
  },
  {
    id: 'prod_003',
    name: 'Conversion Optimization Pro',
    description: 'Maximize your ROI with automated conversion tracking and real-time optimization.',
    price: 299.99,
    image: '🚀'
  }
];

export default function TestProductsPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = React.useState<(typeof products)[0] | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  // Form state with default values
  const [formData, setFormData] = React.useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '5551234567',
    cardNumber: '4242424242424242',
    expiry: '12/25',
    cvc: '123'
  });

  const handleBuyNowClick = React.useCallback((product: (typeof products)[0]) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  }, []);

  const handleCancelCheckout = React.useCallback(() => {
    setIsCheckoutOpen(false);
    setSelectedProduct(null);
  }, []);

  const handlePurchase = React.useCallback(() => {
    if (!selectedProduct) return;

    // Track purchase event with email/phone via pixel (if available)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).trackEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).trackEvent('purchase_intent', {
        email: formData.email,
        phone: formData.phone,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        amount: selectedProduct.price
      });
    }

    // Generate order data at click time (not during render)
    const timestamp = Date.now();
    const orderData = {
      orderId: `ORD-${timestamp}`,
      product: selectedProduct,
      customerEmail: formData.email,
      customerName: formData.name,
      customerPhone: formData.phone,
      purchaseDate: new Date(timestamp).toISOString()
    };

    sessionStorage.setItem('test_order', JSON.stringify(orderData));

    // Close dialog and navigate to order confirmation
    setIsCheckoutOpen(false);
    router.push(ORDER_CONFIRMATION_ROUTE);
  }, [selectedProduct, formData, router]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Test Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            Test the pixel purchase tracking by &quot;buying&quot; one of these products. The purchase will be tracked and attributed to your current session.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow">
            <div className="flex flex-1 flex-col p-6">
              <div className="text-6xl mb-4 text-center">{product.image}</div>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="mt-2 text-sm text-gray-500 flex-1">{product.description}</p>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-2xl font-bold text-gray-900">${product.price}</p>
                <p className="text-sm text-gray-500">USD</p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Button onClick={() => handleBuyNowClick(product)} className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase Now
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your purchase for {selectedProduct?.name} (${selectedProduct?.price})
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Smith" />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john.smith@example.com" />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="5551234567" />
            </div>

            {/* Card Number */}
            <div className="grid gap-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                placeholder="4242 4242 4242 4242"
                maxLength={16}
              />
              <p className="text-xs text-gray-500">Test card: 4242 4242 4242 4242</p>
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input id="expiry" value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} placeholder="MM/YY" maxLength={5} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" value={formData.cvc} onChange={(e) => setFormData({ ...formData, cvc: e.target.value })} placeholder="123" maxLength={3} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelCheckout}>
              Cancel
            </Button>
            <Button onClick={handlePurchase}>Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-8 rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Testing Instructions</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Click any &quot;Purchase Now&quot; button (tracked as button_click event)</li>
                <li>Fill out the checkout form and click &quot;Purchase&quot; (tracked as purchase_intent event with email/phone)</li>
                <li>You&apos;ll be redirected to an order confirmation page (tracked as page_view event)</li>
                <li>The AI will analyze all 3 events (button click + purchase form + confirmation URL) to detect the purchase with high confidence</li>
                <li>Check the Journeys and Sales tables to verify email/phone were captured</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
