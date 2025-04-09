import SubtleBackground from '@/packages/lib/components/subtle-background';
import PricingComponent from './_src/components/pricing';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';

export default async function PricingPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    return (
      <div className="min-h-screen min-w-full overflow-x-hidden">
        <SubtleBackground />
        <div className="mt-12">
          <PricingComponent currentUser={currentUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-full overflow-x-hidden">
      <SubtleBackground />
      <div className="mt-12">
        <PricingComponent currentUser={null} />
      </div>
    </div>
  );
}
