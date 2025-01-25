import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
import { Unauth } from './_src/unauth';
import HUD from './_src/hud';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <Unauth />;
  }

  return (
    <HUD currentUser={currentUser}>
      <div className="lg:ml-64">{children}</div>
    </HUD>
  );
}
