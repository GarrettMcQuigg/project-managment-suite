'use client';

import React from 'react';
import { usePortalSignin } from './_src/hooks/use-portal-signin';
import PortalCredentialsForm from './_src/components/portal-credentials-form';

export default function PortalSignin() {
  const { loading, credentialsForm, handleSignin } = usePortalSignin();

  return <PortalCredentialsForm form={credentialsForm} loading={loading} onSubmit={handleSignin} />;
}
