import { API_AUTH_SIGNUP_AVAILABILITY_EMAIL_ROUTE } from '../routes';
import { fetcher } from './fetcher';

export async function CheckEmailAvailability(email: string): Promise<Error | null> {
  const emailAvailability = await fetcher({
    url: API_AUTH_SIGNUP_AVAILABILITY_EMAIL_ROUTE,
    requestBody: { email }
  });
  if (emailAvailability.err) return new Error('Email is already in use');
  return null;
}
