'use client';

import React, { useState } from 'react';
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
  DASHBOARD_ROUTE
} from '@/packages/lib/routes';
// import { CheckEmailAvailability } from '@/packages/lib/helpers/check-email-availability';

const STEPS = {
  PERSONAL_INFO: 'personal-info',
  PASSWORD: 'password',
  VERIFICATION: 'verification'
};

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.PERSONAL_INFO);
  const personalInfoForm = usePersonalInfoForm();
  const passwordForm = usePasswordForm();
  const verificationForm = useVerificationForm();

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
      // if (phone !== '+16236328385' && phone !== '+19132231730') {
      //   throw new Error('Registration is currently invite-only.');
      // }
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
      const { password, confirmPassword } = passwordForm.getValues();
      if (password !== confirmPassword) {
        throw new Error('Passwords must match.');
      }

      // const { email, phone } = personalInfoForm.getValues();
      // await sendVerificationCodes(email, phone);

      setCurrentStep(STEPS.VERIFICATION);
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
    } else if (currentStep === STEPS.PASSWORD) {
      await handlePasswordStep();
    }
  };

  const prevStep = () => {
    if (currentStep === STEPS.PASSWORD) {
      setCurrentStep(STEPS.PERSONAL_INFO);
    } else if (currentStep === STEPS.VERIFICATION) {
      verificationForm.reset();
      setCurrentStep(STEPS.PASSWORD);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestBody = {
        ...personalInfoForm.getValues(),
        password: passwordForm.getValues('password'),
        confirmPassword: passwordForm.getValues('confirmPassword'),
        emailMFACode: verificationForm.getValues('emailCode'),
        smsMFACode: verificationForm.getValues('smsCode')
      };
      const response = await fetcher({ url: API_AUTH_SIGNUP_ROUTE, requestBody });
      if (response.err) throw new Error(response.message);
      localStorage.clear();
      window.location.href = DASHBOARD_ROUTE;
    } catch (error: Error | unknown) {
      verificationForm.reset();
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
    verificationForm,
    nextStep,
    prevStep,
    handleSignup
  };
};
