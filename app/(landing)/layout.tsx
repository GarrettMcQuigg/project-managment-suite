import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import LandingHeader from './_src/header';
import { LandingPageFooter } from './_src/footer';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="fixed inset-x-0 top-0 z-50">
        <LandingHeader currentUser={currentUser} />
      </div>
      <div className="flex-1 w-full mt-[64px]">{children}</div>
      <LandingPageFooter />
    </div>
  );
}
