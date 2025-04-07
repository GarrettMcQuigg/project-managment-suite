'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { SigninRequestBody } from '@/app/api/auth/signin/types';
import { API_AUTH_SIGNIN_PART_ONE_ROUTE, API_AUTH_SIGNIN_PART_TWO_ROUTE, DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { useCredentialsForm } from '../components/credentials-form';
import { useVerificationForm } from '../components/verification-form';
import { z } from 'zod';
import { CredentialsFormSchema } from '../components/credentials-form';
import { VerificationFormSchema } from '../components/verification-form';

type Steps = 'credentials' | 'verification';

const STEPS: Record<Uppercase<Steps>, Steps> = {
  CREDENTIALS: 'credentials',
  VERIFICATION: 'verification'
} as const;

export const useSignin = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.CREDENTIALS);
  const credentialsForm = useCredentialsForm();
  const verificationForm = useVerificationForm();

  const signinPartOne = async (data: z.infer<typeof CredentialsFormSchema>) => {
    setLoading(true);

    const requestBody: SigninRequestBody = {
      email: data.email,
      password: data.password,
      smsMFACode: ''
    };

    const response = await fetcher({ url: API_AUTH_SIGNIN_PART_ONE_ROUTE, requestBody });

    if (response.err) {
      toast.error(response.message);
    } else {
      setCurrentStep(STEPS.VERIFICATION);
    }

    setLoading(false);
  };

  const signinPartTwo = async (data: z.infer<typeof VerificationFormSchema>) => {
    setLoading(true);

    const { email, password } = credentialsForm.getValues();

    const requestBody: SigninRequestBody = {
      email,
      password,
      smsMFACode: data.smsCode
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
    STEPS,
    loading,
    currentStep,
    credentialsForm,
    verificationForm,
    signinPartOne,
    signinPartTwo
  };
};
