import { API_AUTH_SIGNUP_AVAILABILITY_EMAIL_ROUTE } from '../routes';
import { fetcher } from './fetcher';

export async function CheckEmailAvailability(email: string): Promise<boolean> {
  const isEmailAvailable = await fetcher({
    url: API_AUTH_SIGNUP_AVAILABILITY_EMAIL_ROUTE,
    requestBody: { email }
  });

  return isEmailAvailable.err ? true : false;
}
