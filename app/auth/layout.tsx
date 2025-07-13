import { DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
import { redirect } from 'next/navigation';
import AuthClientWrapper from './_src/components/auth-client-wrapper';
import { LandingBackground } from '@/packages/lib/components/custom-background';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(DASHBOARD_ROUTE);
  }

  return (
    <>
      <LandingBackground />

      <div className="w-full -mt-16">
        <AuthClientWrapper>{children}</AuthClientWrapper>
      </div>
    </>
  );
}
