'use client';

import React from 'react';
import { useSignin } from './_src/hooks/use-signin';
import CredentialsForm from './_src/components/credentials-form';
// import VerificationForm from './_src/components/verification-form';

export default function Signin() {
  const { loading, credentialsForm, handleSignin } = useSignin();

  return <CredentialsForm form={credentialsForm} loading={loading} onSubmit={handleSignin} />;
}
