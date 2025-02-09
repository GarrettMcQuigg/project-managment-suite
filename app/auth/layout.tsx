import SubtleBackground from '@/packages/lib/components/subtle-background';
import { DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(DASHBOARD_ROUTE);
  }

  return (
    <>
      <SubtleBackground />

      <div className="w-full -mt-16">{children}</div>
    </>
  );
}
