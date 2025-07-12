'use client';

import React, { useEffect } from 'react';
import { useSignup } from './_src/hooks/use-signup';
import { PersonalInfoForm } from './_src/components/personal-info-form';
import { VerificationForm } from './_src/components/verification-form';
import { PasswordForm } from './_src/components/password-form';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Signup() {
  const { STEPS, loading, currentStep, personalInfoForm, passwordForm, verificationForm, nextStep, prevStep, handleSignup } = useSignup();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromPricing = searchParams.get('from') === 'pricing';

    if (fromPricing) {
      toast.info('Please create an account to continue');
    }
  }, [searchParams]);

  return (
    <>
      {currentStep === STEPS.PERSONAL_INFO && <PersonalInfoForm form={personalInfoForm} loading={loading} onSubmit={nextStep} />}
      {currentStep === STEPS.PASSWORD && <PasswordForm form={passwordForm} loading={loading} onSubmit={nextStep} onBack={prevStep} />}
      {currentStep === STEPS.VERIFICATION && <VerificationForm form={verificationForm} loading={loading} onSubmit={handleSignup} onBack={prevStep} />}
    </>
  );
}
