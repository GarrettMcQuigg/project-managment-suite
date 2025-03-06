'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/packages/lib/components/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { Button } from '@/packages/lib/components/button';
import { User } from '@prisma/client';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { API_USER_PROFILE_UPDATE_ROUTE } from '@/packages/lib/routes';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const userSettingsSchema = z.object({
  firstname: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastname: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  dateOfBirth: z.string().optional(),
  profileImg: z.instanceof(File).optional(),
  coverImg: z.instanceof(File).optional()
});

type UserSettingsValues = z.infer<typeof userSettingsSchema>;

export default function PersonalSettings({ currentUser }: { currentUser: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const form = useForm<UserSettingsValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      firstname: currentUser?.firstname,
      lastname: currentUser?.lastname,
      email: currentUser?.email,
      phone: currentUser?.phone,
      dateOfBirth: currentUser?.dateOfBirth ? currentUser.dateOfBirth.toISOString().split('T')[0] : undefined
    }
  });

  async function onSubmit(data: UserSettingsValues) {
    setLoading(true);

    const formData = new FormData();
    formData.append('firstname', data.firstname);
    formData.append('lastname', data.lastname);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth);
    if (data.profileImg) formData.append('profileImg', data.profileImg);
    if (data.coverImg) formData.append('coverImg', data.coverImg);

    try {
      const response = await fetcher({
        url: API_USER_PROFILE_UPDATE_ROUTE,
        formData
      });

      if (response.err) {
        toast.error('Failed to update profile');
        return;
      }

      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-1/2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Profile Images */}
          <div className="mb-20">
            <div className="relative">
              <div className="h-32 rounded-lg relative">
                <Image
                  src={coverPreviewUrl || currentUser?.coverImg || '/placeholder.svg?height=128&width=896'}
                  alt="Cover"
                  width={896}
                  height={128}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-12 space-x-2">
                  <FormField
                    control={form.control}
                    name="coverImg"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative h-8 w-8 rounded-full bg-background/70 hover:bg-background text-primary flex items-center justify-center">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file);
                                  setCoverPreviewUrl(URL.createObjectURL(file));
                                }
                              }}
                              disabled={loading}
                              className="sr-only"
                              id="coverImg"
                            />
                            <label htmlFor="coverImg" className="absolute inset-0 flex items-center justify-center cursor-pointer">
                              <Camera className="h-4 w-4" />
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="absolute top-16 left-4">
                <div className="w-32 h-32 rounded-full border-4 border-background bg-background overflow-hidden">
                  <Image
                    src={profilePreviewUrl || currentUser?.profileImg || '/placeholder.svg?height=128&width=128'}
                    alt="Profile"
                    width={896}
                    height={128}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <div className="absolute bottom-0 right-2 rounded-full">
                  <FormField
                    control={form.control}
                    name="profileImg"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative h-8 w-8 rounded-full bg-background/70 hover:bg-background text-primary flex items-center justify-center">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file);
                                  setProfilePreviewUrl(URL.createObjectURL(file));
                                }
                              }}
                              disabled={loading}
                              className="sr-only"
                              id="profileImg"
                            />
                            <label htmlFor="profileImg" className="absolute inset-0 flex items-center justify-center cursor-pointer">
                              <Camera className="h-4 w-4" />
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={loading} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" disabled={loading} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type="date" disabled={loading} />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>

          <div className="flex justify-center pb-6 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Account'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
