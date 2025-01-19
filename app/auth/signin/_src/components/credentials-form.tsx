'use client';

import React, { useEffect } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { AUTH_CHECKPOINT_ROUTE } from '@/packages/lib/routes';
import { Button } from '@/packages/lib/components/button';

export const CredentialsFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const useCredentialsForm = () => {
  return useForm<z.infer<typeof CredentialsFormSchema>>({
    resolver: zodResolver(CredentialsFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
};

interface CredentialsFormProps {
  form: UseFormReturn<z.infer<typeof CredentialsFormSchema>>;
  loading: boolean;
  onSubmit: (data: z.infer<typeof CredentialsFormSchema>) => void;
}

const CredentialsForm: React.FC<CredentialsFormProps> = ({ form, loading, onSubmit }) => {
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      form.setValue('email', storedEmail);
    }
  }, [form]);

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
            </div>

            <div>
              Forgot your password? Click <span className="text-blue-400 cursor-pointer">here</span> to reset it.
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <Link className="w-full" href={AUTH_CHECKPOINT_ROUTE}>
              <Button variant="outline" type="button" className="w-full h-12 mt-6" disabled={loading}>
                Back
              </Button>
            </Link>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CredentialsForm;
