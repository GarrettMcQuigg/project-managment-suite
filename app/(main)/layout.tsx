import { Unauth } from './_src/unauth';
import HUD from './_src/hud';
import SubtleBackground from '@/packages/lib/components/subtle-background';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { redirect } from 'next/navigation';
import { AUTH_SIGNIN_ROUTE } from '@/packages/lib/routes';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return <Unauth />;
  }

  if (sessionContext.type === 'none') {
    redirect(AUTH_SIGNIN_ROUTE);
  }

  if (sessionContext.type === 'user') {
    return (
      <HUD currentUser={sessionContext.user}>
        <SubtleBackground />

        <div>{children}</div>
      </HUD>
    );
  }

  return <>{children}</>;
}
