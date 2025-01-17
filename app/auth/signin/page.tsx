'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Types
interface SigninRequestBody {
  email: string;
  password: string;
  smsMFACode?: string;
}

interface FetcherParams {
  url: string;
  requestBody: SigninRequestBody;
}

// Constants
const API_AUTH_SIGNIN_PART_TWO_ROUTE = '/api/auth/signin/part-two';
const DASHBOARD_ROUTE = '/dashboard';

// Fetcher utility
const fetcher = async ({ url, requestBody }: FetcherParams) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      return { err: true, message: data.message || 'An error occurred' };
    }

    return { err: false, data };
  } catch (error) {
    return { err: true, message: 'Network error occurred' };
  }
};

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    smsCode: '' // Added for MFA support
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { email, password, smsCode } = formData;

    const requestBody: SigninRequestBody = {
      email,
      password,
      smsMFACode: smsCode
    };

    const response = await fetcher({
      url: API_AUTH_SIGNIN_PART_TWO_ROUTE,
      requestBody
    });

    if (response.err) {
      toast.error(response.message);
      setLoading(false);
    } else {
      localStorage.clear();
      window.location.href = DASHBOARD_ROUTE;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Sign in to your account</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="smsCode" className="block text-sm font-medium text-gray-700">
                SMS Code
              </label>
              <input
                id="smsCode"
                name="smsCode"
                type="text"
                autoComplete="one-time-code"
                value={formData.smsCode}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter SMS code"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
