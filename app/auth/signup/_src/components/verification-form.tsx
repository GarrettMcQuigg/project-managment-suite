import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@packages/lib/components/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@packages/lib/components/form';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/packages/lib/components/input-otp';
// import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';

const otpSlotClass =
  'sm:w-12 sm:h-12 text-2xl backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400';

export const useVerificationForm = () => {
  return useForm<z.infer<typeof VerificationFormSchema>>({
    resolver: zodResolver(VerificationFormSchema)
  });
};

export const VerificationFormSchema = z.object({
  emailCode: z.string().min(1, 'Email code is required'),
  smsCode: z.string().min(1, 'SMS code is required')
});

interface VerificationFormProps {
  form: UseFormReturn<z.infer<typeof VerificationFormSchema>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ form, loading, onSubmit, onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Verify your contact info</h2>
        </div>
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <div className="flex flex-wrap gap-4 my-12 w-full">
              <FormField
                control={form.control}
                name="smsCode"
                render={({ field }) => (
                  <FormItem className="mx-auto">
                    <FormLabel>SMS Code</FormLabel>
                    <InputOTP {...field} autoFocus spellCheck={false} className="mx-auto" maxLength={6} required disabled={loading}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className={otpSlotClass} />
                        <InputOTPSlot index={1} className={otpSlotClass} />
                        <InputOTPSlot index={2} className={otpSlotClass} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} className={otpSlotClass} />
                        <InputOTPSlot index={4} className={otpSlotClass} />
                        <InputOTPSlot index={5} className={otpSlotClass} />
                      </InputOTPGroup>
                    </InputOTP>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailCode"
                render={({ field }) => (
                  <FormItem className="mx-auto">
                    <FormLabel>Email Code</FormLabel>
                    <InputOTP {...field} spellCheck={false} className="mx-auto" maxLength={6} required disabled={loading}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className={otpSlotClass} />
                        <InputOTPSlot index={1} className={otpSlotClass} />
                        <InputOTPSlot index={2} className={otpSlotClass} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} className={otpSlotClass} />
                        <InputOTPSlot index={4} className={otpSlotClass} />
                        <InputOTPSlot index={5} className={otpSlotClass} />
                      </InputOTPGroup>
                    </InputOTP>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap">
              <Button type="submit" className="w-full h-12 mt-6" loading={loading}>
                Sign up
              </Button>
              <Button onClick={onBack} variant="outline" type="button" className="w-full h-12 mt-6" disabled={loading}>
                Back
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
