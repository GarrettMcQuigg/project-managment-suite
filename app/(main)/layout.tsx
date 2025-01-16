// import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
// import HUD from './_src/hud';
// import { getCurrentEmployee } from '@/lib/helpers/get-current-employee';
// import { Unauth } from './_src/unauth';
// import { checkInternalAccess } from '@/lib/helpers/check-internal-access';

export default async function BMSLayout({ children }: { children: React.ReactNode }) {
  // const currentUser = await getCurrentUser();
  // const currentEmployee = await getCurrentEmployee();

  // if (!currentUser) {
  //   return <Unauth />;
  // }

  return (
    <div>
      <div>fuck!</div>
    </div>
    // <HUD currentUser={currentUser} currentEmployee={currentEmployee}>
    //   {children}
    // </HUD>
  );
}
