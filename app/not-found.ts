import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { AUTH_SIGNIN_ROUTE, DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { redirect } from 'next/navigation';

export default async function NotFound() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(AUTH_SIGNIN_ROUTE);
  } else {
    redirect(DASHBOARD_ROUTE);
  }
}
