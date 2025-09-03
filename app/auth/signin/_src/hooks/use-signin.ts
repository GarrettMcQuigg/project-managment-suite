'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { SigninRequestBody } from '@/app/api/auth/signin/types';
import { API_AUTH_SIGNIN_PART_TWO_ROUTE, DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { useCredentialsForm } from '../components/credentials-form';
import { z } from 'zod';
import { CredentialsFormSchema } from '../components/credentials-form';

export const useSignin = () => {
  const [loading, setLoading] = useState(false);
  const credentialsForm = useCredentialsForm();

  const handleSignin = async (data: z.infer<typeof CredentialsFormSchema>) => {
    setLoading(true);

    const requestBody: SigninRequestBody = {
      email: data.email,
      password: data.password,
      smsMFACode: '000000' // Skip phone verification
    };

    const response = await fetcher({ url: API_AUTH_SIGNIN_PART_TWO_ROUTE, requestBody });

    if (response.err) {
      toast.error(response.message);
      setLoading(false);
    } else {
      localStorage.clear();
      window.location.href = DASHBOARD_ROUTE;
    }
  };

  return {
    loading,
    credentialsForm,
    handleSignin
  };
};
