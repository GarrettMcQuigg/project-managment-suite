import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import LandingPage from './_src/temp-landing-page';

export default async function Home() {
  let currentUser = await getCurrentUser();

  if (!currentUser) {
    currentUser = null;
  }

  return (
    <div className="flex flex-col min-h-screen-minus-header overflow-hidden supports-[overflow:clip]:overflow-clip">
      <LandingPage currentUser={currentUser} />
    </div>
  );
}
