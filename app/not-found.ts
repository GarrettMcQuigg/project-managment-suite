import { DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { redirect } from 'next/navigation';

export default async function NotFound() {
  redirect(DASHBOARD_ROUTE); // TODO : Maybe change to signin route
}
