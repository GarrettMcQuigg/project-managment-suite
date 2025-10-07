import { FeaturesSection } from './components/features';
import { HeroSection } from './components/hero';
import { NewsletterSection } from './components/newsletter';
import { TestimonialsSection } from './components/testimonials';
import { CompatibilitySection } from './components/compatibility';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';

export default async function LandingPage() {
  const currentUser = await getCurrentUser();

  return (
    <>
      <main className="relative z-10 flex-1">
        <HeroSection />
        <FeaturesSection />
        <CompatibilitySection currentUser={currentUser} />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
    </>
  );
}
