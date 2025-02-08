'use client';

import CustomBackground from '@/packages/lib/components/custom-background';
import { useEffect } from 'react';
import { HeroSection } from './hero';
import { ShowcaseSection } from './showcase';
import { TestimonialsSection } from './testimonials';
import { NewsletterSection } from './newsletter';

export default function LandingPage() {
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      localStorage.removeItem('email');
    }
  }, []);

  return (
    <>
      <CustomBackground />
      <main className="relative z-10 flex-1">
        <HeroSection />
        <ShowcaseSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
    </>
  );
}
