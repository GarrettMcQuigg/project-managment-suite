// app/auth/signin/_src/verification-form.tsx
'use client';

import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/packages/lib/components/form';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/packages/lib/components/input-otp';
import { Button } from '@/packages/lib/components/button';
import { AUTH_CHECKPOINT_ROUTE, AUTH_SIGNIN_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Verify your identity</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter the verification code sent to your phone</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="flex justify-center rounded-md shadow-sm space-y-4">
              <FormField
                control={form.control}
                name="smsCode"
                render={({ field }) => (
                  <FormItem className="mx-auto">
                    <FormLabel>SMS Code</FormLabel>
                    <InputOTP {...field} autoFocus spellCheck={false} className="mx-auto" maxLength={6} required disabled={loading}>
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="sm:w-12 sm:h-12 text-2xl backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400"
                        />
                        <InputOTPSlot
                          index={1}
                          className="sm:w-12 sm:h-12 text-2xl backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400"
                        />
                        <InputOTPSlot
                          index={2}
                          className="sm:w-12 sm:h-12 text-2xl backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={3}
                          className="sm:w-12 sm:h-12 text-2xl backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400"
                        />
                        <InputOTPSlot
                          index={4}
                          className="sm:w-12 sm:h-12 text-2xl backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400"
                        />
                        <InputOTPSlot
                          index={5}
                          className="sm:w-12 sm:h-12 text-2xl backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button className="w-full" type="submit" disabled={loading} loading={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button variant="outline" onClick={() => router.push(AUTH_CHECKPOINT_ROUTE)} type="button" className="w-full mt-6" disabled={loading}>
              Back
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerificationForm;
