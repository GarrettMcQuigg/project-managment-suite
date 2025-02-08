'use client';

import CustomBackground from '@/packages/lib/components/custom-background';
import LandingHeader from './header';
import { useEffect } from 'react';
import { User } from '@prisma/client';
import { HeroSection } from './hero';
import { ShowcaseSection } from './showcase';
import { TestimonialsSection } from './testimonials';
import { NewsletterSection } from './newsletter';
import { LandingPageFooter } from './footer';

export default function LandingPage({ currentUser }: { currentUser: User | null }) {
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      localStorage.removeItem('email');
    }
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen">
      <CustomBackground />
      <LandingHeader currentUser={currentUser} />
      <main className="relative z-10 flex-1">
        <HeroSection />
        <ShowcaseSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <LandingPageFooter />
    </div>
  );
}
