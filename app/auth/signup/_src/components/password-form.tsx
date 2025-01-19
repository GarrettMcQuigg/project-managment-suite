import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@packages/lib/components/button';
import { Input } from '@packages/lib/components/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@packages/lib/components/form';

export const usePasswordForm = () => {
  return useForm<z.infer<typeof PasswordFormSchema>>({
    resolver: zodResolver(PasswordFormSchema)
  });
};

export const PasswordFormSchema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Confirm password is required')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

interface PasswordFormProps {
  form: UseFormReturn<z.infer<typeof PasswordFormSchema>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({ form, loading, onSubmit, onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">Create a Password</h2>
        </div>
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <div className="flex flex-wrap gap-4 mb-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Password</FormLabel>
                    <Input {...field} autoFocus type="password" required disabled={loading} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Confirm Password</FormLabel>
                    <Input {...field} type="password" required disabled={loading} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap">
              <Button type="submit" className="w-full h-12 mt-6" loading={loading}>
                Next
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
