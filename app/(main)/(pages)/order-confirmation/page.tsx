'use client';

import { Button } from '@/packages/lib/components/button';
import { TEST_PRODUCTS_ROUTE } from '@/packages/lib/routes';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface OrderData {
  orderId: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  customerEmail: string;
  purchaseDate: string;
}

function getOrderDataFromStorage(): OrderData | null {
  if (typeof window === 'undefined') return null;

  const storedOrder = sessionStorage.getItem('test_order');
  if (storedOrder) {
    sessionStorage.removeItem('test_order');
    return JSON.parse(storedOrder);
  }
  return null;
}

export default function OrderConfirmationPage() {
  const [orderData] = useState<OrderData | null>(() => getOrderDataFromStorage());

  if (!orderData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-900">No Order Found</h1>
          <p className="mt-2 text-sm text-gray-600">It looks like you navigated here directly. Please purchase a product first.</p>
          <Link href={TEST_PRODUCTS_ROUTE}>
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Thank You for Your Order!</h1>
          <p className="mt-2 text-lg text-gray-600">Your purchase has been confirmed</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Confirmation</h2>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Order Number */}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Order Number:</span>
              <span className="text-sm font-semibold text-gray-900">{orderData.orderId}</span>
            </div>

            {/* Email */}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <span className="text-sm text-gray-900">{orderData.customerEmail}</span>
            </div>

            {/* Order Date */}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Order Date:</span>
              <span className="text-sm text-gray-900">
                {new Date(orderData.purchaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Details</h3>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{orderData.product.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Product ID: {orderData.product.id}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">${orderData.product.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-gray-900">${orderData.product.price.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* AI Detection Notice */}
        <div className="mt-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Purchase Tracking Active</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  This page will be automatically analyzed by our AI-powered purchase detection system. The purchase should be recorded in your Journeys and Sales tables within a
                  few seconds.
                </p>
                <p className="mt-2">
                  <strong>What&apos;s happening:</strong> The pixel is analyzing this page&apos;s URL (contains &quot;order-confirmation&quot;), title (contains &quot;Order
                  Confirmation&quot;), and content (order details, price, email) to detect and track this purchase.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href={TEST_PRODUCTS_ROUTE}>
            <Button variant="outline">Browse More Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
