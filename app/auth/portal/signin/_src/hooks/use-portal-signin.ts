import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortalCredentialsForm, PortalCredentialsFormSchema } from '../components/portal-credentials-form';
import { z } from 'zod';
import { toast } from 'react-toastify';

export const usePortalSignin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const credentialsForm = usePortalCredentialsForm();

  const slug = searchParams.get('slug');
  const projectId = searchParams.get('projectId');
  const redirect = searchParams.get('redirect') || `/projects/${projectId}/portal/${slug}`;

  const handleSignin = async (data: z.infer<typeof PortalCredentialsFormSchema>) => {
    if (!slug || !projectId) {
      toast.error('Invalid portal access');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/portal/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visitorName: data.visitorName,
          password: data.password,
          redirect
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Welcome, ' + data.visitorName + '!');
        router.push(result.redirect || redirect);
      } else {
        toast.error(result.error || 'Invalid credentials');
        credentialsForm.setError('password', {
          message: result.error || 'Invalid password'
        });
      }
    } catch (error) {
      console.error('Portal signin error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    credentialsForm,
    handleSignin
  };
};
