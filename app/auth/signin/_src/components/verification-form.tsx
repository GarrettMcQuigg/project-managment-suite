// app/auth/signin/_src/verification-form.tsx
'use client';

import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export const VerificationFormSchema = z.object({
  smsCode: z.string().min(1, 'SMS code is required')
});

export const useVerificationForm = () => {
  return useForm<z.infer<typeof VerificationFormSchema>>({
    resolver: zodResolver(VerificationFormSchema),
    defaultValues: {
      smsCode: ''
    }
  });
};

interface VerificationFormProps {
  form: UseFormReturn<z.infer<typeof VerificationFormSchema>>;
  loading: boolean;
  onSubmit: (data: z.infer<typeof VerificationFormSchema>) => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ form, loading, onSubmit }) => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Verify your identity</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter the verification code sent to your phone</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <FormField
                control={form.control}
                name="smsCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter verification code" autoComplete="one-time-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerificationForm;
