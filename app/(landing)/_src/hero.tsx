'use client';

import { Button } from '@/packages/lib/components/button';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-16 lg:py-24 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Unleash Your Creative Potential with CreativeSuite CRM</h1>
              <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Streamline your workflow, manage clients, and boost productivity. The ultimate CRM designed for creatives, by creatives.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="bg-primary/70 text-white hover:bg-primary/90">Get Started</Button>
              <Button variant="outline">Watch Demo</Button>
            </div>
          </div>
          <div className="relative w-[600px] h-[400px] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 md:block hidden">
            <div className="absolute inset-0">
              <Image src="/images/landing/landing-page-stock-img.jpg" fill priority alt="Background" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
