import React, { useEffect } from 'react';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@packages/lib/components/button';
import { Input } from '@packages/lib/components/input';
// import { InputPhone } from '@packages/lib/components/input-phone';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@packages/lib/components/form';
import { ROOT_ROUTE, AUTH_SIGNIN_ROUTE, AUTH_CHECKPOINT_ROUTE } from '@/packages/lib/routes';

export const usePersonalInfoForm = () => {
  return useForm<z.infer<typeof PersonalInfoFormSchema>>({
    resolver: zodResolver(PersonalInfoFormSchema)
  });
};

const PersonalInfoFormSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required')
});

interface PersonalInfoFormProps {
  form: UseFormReturn<z.infer<typeof PersonalInfoFormSchema>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ form, loading, onSubmit }) => {
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
                    <Input {...field} placeholder="john@example.com" disabled />
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
                      <Input {...field} autoFocus placeholder="John" disabled={loading} />
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
                      <Input {...field} autoFocus placeholder="Smith" disabled={loading} />
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
                    {/* <InputPhone {...field} placeholder="(913) 555-0123" defaultCountry="US" required disabled={loading} /> */}
                    <Input {...field} placeholder="(913) 555-0123" required disabled={loading} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-wrap w-full">
              <Button type="submit" className="w-full h-12 mt-6" loading={loading}>
                Next
              </Button>
              <Link className="w-full" href={AUTH_CHECKPOINT_ROUTE}>
                <Button variant="outline" type="button" className="w-full h-12 mt-6" disabled={loading}>
                  Back
                </Button>
              </Link>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-center mt-6">
              Already have an account?{' '}
              <Link href={AUTH_SIGNIN_ROUTE} className="ml-2">
                <Button variant="link" type="button" disabled={loading}>
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
