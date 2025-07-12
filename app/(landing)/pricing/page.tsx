import PricingComponent from './_src/components/pricing';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { LandingBackground } from '@/packages/lib/components/custom-background';

export default async function PricingPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen min-w-full overflow-x-hidden">
      <LandingBackground />
      <div className="mt-12">
        <PricingComponent currentUser={currentUser ? currentUser : null} />
      </div>
    </div>
  );
}
