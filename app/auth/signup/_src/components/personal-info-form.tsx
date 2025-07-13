'use client';

import React from 'react';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@packages/lib/components/button';
import { Input } from '@packages/lib/components/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@packages/lib/components/form';
import { AUTH_SIGNIN_ROUTE } from '@/packages/lib/routes';

const PersonalInfoFormSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(14, 'Please enter a complete phone number')
    .regex(/^\(\d{3}\) \d{3} - \d{4}$/, 'Phone number must be in format (000) 000 - 0000')
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
                      type="email"
                      autoFocus
                      placeholder="john@example.com"
                      required
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
                        placeholder="John"
                        required
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
                        required
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
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormItem className="w-full">
                    <FormLabel>Phone #</FormLabel>
                    <Input
                      className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/40 border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2  focus:border-violet-500 dark:focus:border-violet-400"
                      name={name}
                      ref={ref}
                      value={value}
                      onBlur={onBlur}
                      type="tel"
                      placeholder="(000) 000 - 0000"
                      pattern="\(\d{3}\)\s\d{3}\s-\s\d{4}"
                      required
                      disabled={loading}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const digits = inputValue.replace(/\D/g, '').slice(0, 10);
                        
                        let formattedValue = '';
                        if (digits.length <= 3) {
                          formattedValue = digits.length ? `(${digits}` : '';
                        } else if (digits.length <= 6) {
                          formattedValue = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                        } else {
                          formattedValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6, 10)}`;
                        }
                        
                        onChange(formattedValue);
                      }}
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
            </div>
            <div className="flex justify-center items-center gap-2 text-gray-600 dark:text-gray-400 text-center mt-6">
              Already have an account?
              <Link href={AUTH_SIGNIN_ROUTE}>
                <div className="cursor-pointer hover:underline hover:underline-offset-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200">Sign in</div>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
