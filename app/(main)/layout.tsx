import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
import { Unauth } from './_src/unauth';
import HUD from './_src/hud';
// import HUD from './_src/hud';
// import { getCurrentEmployee } from '@/lib/helpers/get-current-employee';
// import { checkInternalAccess } from '@/lib/helpers/check-internal-access';

// export default async function BMSLayout({ children }: { children: React.ReactNode }) {
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  // const currentEmployee = await getCurrentEmployee();

  console.log('currentUser', currentUser);

  if (!currentUser) {
    return <Unauth />;
  }

  return (
    <HUD currentUser={currentUser}>
      <div>{children}</div>
    </HUD>
    // <HUD currentUser={currentUser} currentEmployee={currentEmployee}>
    //   {children}
    // </HUD>
  );
}
