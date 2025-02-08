import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import LandingPage from './_src/landing-page';

export default async function Home() {
  let currentUser = await getCurrentUser();

  if (!currentUser) {
    currentUser = null;
  }

  return <LandingPage />;
}
