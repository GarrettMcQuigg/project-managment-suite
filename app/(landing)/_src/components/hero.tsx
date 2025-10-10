'use client';

import { Button } from '@/packages/lib/components/button';
import { ArrowRight, ChevronDown, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { AUTH_SIGNUP_ROUTE } from '@/packages/lib/routes';
import { useEffect, useRef, useState } from 'react';

const floatingAssets = [
  { quote: 'Game changer!', rating: 5, position: 'top-[15%] left-[5%]', delay: 0, pulseColor: '#18B2AA' },
  { quote: 'Consistently saves me 15hrs per week', rating: 5, position: 'top-[25%] right-[8%]', delay: 200, pulseColor: '#18B2AA' },
  { quote: 'Best tool for creatives', rating: 5, position: 'bottom-[30%] left-[8%]', delay: 400, pulseColor: '#18B2AA' },
  { quote: 'Clients love the portal!', rating: 5, position: 'bottom-[20%] right-[12%]', delay: 600, pulseColor: '#18B2AA' }
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex items-center justify-center px-4 pt-32 md:pt-24 pb-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 via-primary/5 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-radial from-secondary/15 via-secondary/5 to-transparent blur-3xl opacity-40" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {floatingAssets.map((asset, index) => (
        <div
          key={index}
          className={`hidden lg:block absolute ${asset.position} transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: `${asset.delay}ms` }}
        >
          <div className="group relative">
            {/* Connecting line decoration */}
            <div className="absolute top-1/2 -right-20 w-16 h-[1px] bg-gradient-to-r from-border/50 to-transparent" />

            {/* Glassmorphic card */}
            <div className="backdrop-blur-xl bg-card/40 border border-border/50 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 max-w-[200px]">
              <div className="space-y-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: asset.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm font-medium text-foreground leading-snug">"{asset.quote}"</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-12">
          <div className={`max-w-5xl space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-primary/5 text-primary px-6 py-3 rounded-full text-sm font-medium border border-primary/20 shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by creative professionals worldwide</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-balance">
                Transform How You
                <span className="block bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mt-2 flex">Think About Business</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
                Keep your projects organized, manage client relationships, track analytics, handle invoices and collaborate seamlessly—all in one powerful platform
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={AUTH_SIGNUP_ROUTE}>
                <Button className="text-lg px-6 py-6 group opacity-90">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {/* TODO: Add demo video */}
              {/* <Link href="#">
                <Button variant="outline" className="text-lg px-6 py-6">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </Link> */}
            </div>
          </div>

          <div className={`relative w-full max-w-4xl transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="relative z-10 will-change-transform group">
              {/* Enhanced decorative blur background */}
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <ChevronDown className="w-6 h-6 text-primary" />
        </div>
      </div>
    </section>
  );
}
