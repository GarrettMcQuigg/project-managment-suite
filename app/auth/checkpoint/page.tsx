'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_AUTH_CHECKPOINT_ROUTE, AUTH_SIGNIN_ROUTE, AUTH_SIGNUP_ROUTE, DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { Button } from '@/packages/lib/components/button';
import { AuthCheckpointRequestBody } from '@/app/api/auth/checkpoint/types';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      localStorage.removeItem('email');
    }
  }, []);

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

    const { email } = formData;

    const requestBody: AuthCheckpointRequestBody = {
      email
    };

    const response = await fetcher({
      url: API_AUTH_CHECKPOINT_ROUTE,
      requestBody
    });

    if (response.err) {
      toast.error(response.message);
      setLoading(false);
    } else {
      localStorage.setItem('email', email);
      router.push(response.content.redirect);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Enter your email address</h2>
          <h5 className="mt-6 text-center text-normal">Please enter your email address to continue</h5>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>By authenticating, you agree to our Terms of Service and Privacy Policy.</div>

          <div>
            <Button>Next</Button>
            <Button>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
