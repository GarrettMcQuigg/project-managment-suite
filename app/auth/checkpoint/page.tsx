'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_AUTH_CHECKPOINT_ROUTE, AUTH_SIGNIN_ROUTE, AUTH_SIGNUP_ROUTE, DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { Button } from '@/packages/lib/components/button';
import { AuthCheckpointRequestBody } from '@/app/api/auth/checkpoint/types';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { CheckpointForm } from './_src/checkpoint-form';

export default function SignIn() {
  return (
    <>
      <CheckpointForm />
    </>
  );
}
