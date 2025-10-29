'use client';

import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/packages/lib/components/button';
import { AUTH_SIGNIN_ROUTE, ROOT_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';

export const PortalCredentialsFormSchema = z.object({
  visitorName: z.string().min(3, 'Name must be at least 3 characters long'),
  password: z.string().min(1, 'Password is required')
});

export const usePortalCredentialsForm = () => {
  return useForm<z.infer<typeof PortalCredentialsFormSchema>>({
    resolver: zodResolver(PortalCredentialsFormSchema),
    defaultValues: {
      visitorName: '',
      password: ''
    }
  });
};

interface PortalCredentialsFormProps {
  form: UseFormReturn<z.infer<typeof PortalCredentialsFormSchema>>;
  loading: boolean;
  onSubmit: (data: z.infer<typeof PortalCredentialsFormSchema>) => void;
}

const PortalCredentialsForm: React.FC<PortalCredentialsFormProps> = ({ form, loading, onSubmit }) => {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Project Portal Access</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">Please enter your name and the portal password to access this project portal.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <FormField
                control={form.control}
                name="visitorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input
                        className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:border-violet-500 dark:focus:border-violet-400"
                        type="text"
                        placeholder="Enter your name"
                        disabled={loading}
                        {...field}
                      />
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
                      <Input
                        className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:border-violet-500 dark:focus:border-violet-400"
                        type="password"
                        placeholder="Enter portal password"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button className="w-full" type="submit" disabled={loading} loading={loading}>
              {loading ? 'Accessing...' : 'Access Portal'}
            </Button>

            <Button className="w-full" type="button" variant="outline" onClick={() => router.push(ROOT_ROUTE)}>
              Cancel
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PortalCredentialsForm;
