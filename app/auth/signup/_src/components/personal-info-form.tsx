'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@packages/lib/components/button';
import { Input } from '@packages/lib/components/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@packages/lib/components/form';
import { AUTH_SIGNIN_ROUTE, AUTH_CHECKPOINT_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';

const PersonalInfoFormSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required')
});

export const usePersonalInfoForm = () => {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  return useForm<z.infer<typeof PersonalInfoFormSchema>>({
    resolver: zodResolver(PersonalInfoFormSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: storedEmail || '',
      phone: ''
    }
  });
};

interface PersonalInfoFormProps {
  form: UseFormReturn<z.infer<typeof PersonalInfoFormSchema>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ form, loading, onSubmit }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Create an account</h2>
        </div>
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <div className="flex flex-wrap gap-4 mb-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Email</FormLabel>
                    <Input
                      className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2  focus:border-violet-500 dark:focus:border-violet-400"
                      {...field}
                      placeholder="john@example.com"
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>First Name</FormLabel>
                      <Input
                        className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2  focus:border-violet-500 dark:focus:border-violet-400"
                        {...field}
                        autoFocus
                        placeholder="John"
                        disabled={loading}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2  focus:border-violet-500 dark:focus:border-violet-400"
                        {...field}
                        placeholder="Smith"
                        disabled={loading}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Phone #</FormLabel>
                    <Input
                      className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2  focus:border-violet-500 dark:focus:border-violet-400"
                      {...field}
                      placeholder="(913) 555-0123"
                      required
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-wrap w-full">
              <Button type="submit" className="w-full mt-6" loading={loading}>
                Next
              </Button>
              <Button variant="outline" onClick={() => router.push(AUTH_CHECKPOINT_ROUTE)} type="button" className="w-full mt-6" disabled={loading}>
                Back
              </Button>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-center mt-6">
              Already have an account?{' '}
              <Link href={AUTH_SIGNIN_ROUTE} onClick={() => localStorage.removeItem('email')}>
                <Button variant="link" type="button" disabled={loading} loading={loading}>
                  Sign in
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
