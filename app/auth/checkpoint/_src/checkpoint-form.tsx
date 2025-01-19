'use client';

import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_AUTH_CHECKPOINT_ROUTE, ROOT_ROUTE } from '@/packages/lib/routes';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { Button } from '@/packages/lib/components/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';

const CheckpointFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format')
});

type FormData = z.infer<typeof CheckpointFormSchema>;

export function CheckpointForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(CheckpointFormSchema),
    defaultValues: {
      email: ''
    }
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      form.setValue('email', storedEmail);
      localStorage.removeItem('email');
    }
  }, [form]);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);

    try {
      const response = await fetcher({
        url: API_AUTH_CHECKPOINT_ROUTE,
        requestBody: {
          email: formData.email
        }
      });

      if (response.err) {
        toast.error(response.message);
      } else {
        localStorage.setItem('email', formData.email);
        router.push(response.content.redirect);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Enter your email address</h2>
          <h5 className="mt-6 text-center text-normal">Please enter your email address to continue</h5>
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
                      <Input
                        className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2  focus:border-violet-500 dark:focus:border-violet-400"
                        type="email"
                        placeholder="Enter your email"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="text-sm text-gray-400">By authenticating, you agree to our Terms of Service and Privacy Policy.</div>

            <div className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" loading={loading}>
                Next
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => router.push(ROOT_ROUTE)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
