'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_AUTH_SIGNIN_PART_TWO_ROUTE, DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { SigninRequestBody } from '@/app/api/auth/signin/types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  smsCode: z.string().optional()
});

type FormValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      smsCode: ''
    }
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      form.setValue('email', storedEmail);
    }
  }, [form]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    const requestBody: SigninRequestBody = {
      email: data.email,
      password: data.password,
      smsMFACode: data.smsCode || ''
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Sign in to your account</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smsCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMS Code</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter SMS code" autoComplete="one-time-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              Forgot your password? Click <span className="text-blue-400 cursor-pointer">here</span> to reset it.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}
