'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetcher } from '@packages/lib/helpers/fetcher';
import { usePersonalInfoForm } from '../components/personal-info-form';
import { usePasswordForm } from '../components/password-form';
import { useVerificationForm } from '../components/verification-form';
import {
  // API_AUTH_SIGNUP_AVAILABILITY_EMAIL_ROUTE,
  // API_AUTH_SIGNUP_AVAILABILITY_PHONE_ROUTE,
  // API_AUTH_MFA_SEND_EMAIL_ROUTE,
  // API_AUTH_MFA_SEND_SMS_ROUTE,
  API_AUTH_SIGNUP_ROUTE,
  DASHBOARD_ROUTE,
  PRICING_ROUTE
} from '@/packages/lib/routes';
import { useRouter, useSearchParams } from 'next/navigation';
// import { CheckEmailAvailability } from '@/packages/lib/helpers/check-email-availability';

const STEPS = {
  PERSONAL_INFO: 'personal-info',
  PASSWORD: 'password'
};

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.PERSONAL_INFO);
  const personalInfoForm = usePersonalInfoForm();
  const passwordForm = usePasswordForm();
  const verificationForm = useVerificationForm();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fromPricing = searchParams.get('from') === 'pricing';
    if (fromPricing) {
      sessionStorage.setItem('returnToPricing', 'true');
    }
  }, [searchParams]);

  const checkAvailability = async (email: string, phone: string) => {
    console.log(phone, email);
    // const emailAvailability = await fetcher({
    //   url: API_AUTH_SIGNUP_AVAILABILITY_EMAIL_ROUTE,
    //   requestBody: { email }
    // });
    // if (emailAvailability.err) throw new Error(emailAvailability.message);

    // const emailAvailability = await CheckEmailAvailability(email);

    // const phoneAvailability = await fetcher({
    //   url: API_AUTH_SIGNUP_AVAILABILITY_PHONE_ROUTE,
    //   requestBody: { phone }
    // });
    // if (phoneAvailability.err) throw new Error(phoneAvailability.message);
  };

  // const sendVerificationCodes = async (email: string, phone: string) => {
  //   const emailResponse = await fetcher({
  //     url: API_AUTH_MFA_SEND_EMAIL_ROUTE,
  //     requestBody: { email }
  //   });
  //   if (emailResponse.err) throw new Error(emailResponse.message);

  //   const smsResponse = await fetcher({
  //     url: API_AUTH_MFA_SEND_SMS_ROUTE,
  //     requestBody: { phone }
  //   });
  //   if (smsResponse.err) throw new Error(smsResponse.message);
  // };

  const handleRegistrationStep = async () => {
    setLoading(true);
    try {
      const { email, phone } = personalInfoForm.getValues();
      await checkAvailability(email, phone);

      setCurrentStep(STEPS.PASSWORD);
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        console.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordStep = async () => {
    setLoading(true);
    try {
      // First validate the form using the schema
      const result = await passwordForm.trigger();
      if (!result) {
        // If validation fails, don't proceed
        return;
      }
      
      const { password, confirmPassword } = passwordForm.getValues();
      if (password !== confirmPassword) {
        throw new Error('Passwords must match.');
      }

      // Skip verification step and directly call signup
      await executeSignup();
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        console.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep === STEPS.PERSONAL_INFO) {
      await handleRegistrationStep();
    }
  };

  const prevStep = () => {
    if (currentStep === STEPS.PASSWORD) {
      setCurrentStep(STEPS.PERSONAL_INFO);
    }
  };

  const executeSignup = async () => {
    const emailMFACode = '000000';
    const smsMFACode = '000000';
    
    const requestBody = {
      ...personalInfoForm.getValues(),
      password: passwordForm.getValues('password'),
      confirmPassword: passwordForm.getValues('confirmPassword'),
      emailMFACode,
      smsMFACode
    };
    const response = await fetcher({ url: API_AUTH_SIGNUP_ROUTE, requestBody });
    if (response.err) throw new Error(response.message);
    localStorage.clear();

    const returnToPricing = sessionStorage.getItem('returnToPricing');
    if (returnToPricing) {
      sessionStorage.removeItem('returnToPricing');
      router.push(PRICING_ROUTE);
    } else {
      router.push(DASHBOARD_ROUTE);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First validate the form using the schema
      const result = await passwordForm.trigger();
      if (!result) {
        return;
      }
      
      const { password, confirmPassword } = passwordForm.getValues();
      if (password !== confirmPassword) {
        throw new Error('Passwords must match.');
      }

      await executeSignup();
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        console.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    STEPS,
    loading,
    currentStep,
    personalInfoForm,
    passwordForm,
    nextStep,
    prevStep,
    handleSignup
  };
};
