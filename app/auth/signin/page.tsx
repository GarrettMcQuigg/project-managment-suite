'use client';

import React from 'react';
import { useSignin } from './_src/hooks/use-signin';
import CredentialsForm from './_src/credentials-form';
import VerificationForm from './_src/verification-form';

export default function Signin() {
  const { STEPS, loading, currentStep, credentialsForm, verificationForm, signinPartOne, signinPartTwo } = useSignin();

  return (
    <>
      {currentStep === STEPS.CREDENTIALS && <CredentialsForm form={credentialsForm} loading={loading} onSubmit={signinPartOne} />}
      {currentStep === STEPS.VERIFICATION && <VerificationForm form={verificationForm} loading={loading} onSubmit={signinPartTwo} />}
    </>
  );
}
