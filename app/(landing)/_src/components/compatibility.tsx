'use client';

import { Button } from '@/packages/lib/components/button';
import type { User } from '@prisma/client';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AUTH_SIGNIN_ROUTE, DASHBOARD_ROUTE } from '@/packages/lib/routes';
import { useEffect, useRef, useState } from 'react';

export function CompatibilitySection({ currentUser }: { currentUser: User | null }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side - Text Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="space-y-4">
              <div className="text-primary text-sm font-semibold uppercase tracking-wider">Compatible with all devices</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-balance">Desktop and mobile.</h2>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
              Run your business from anywhere with our fully responsive web app. Manage your team, track your operations, and keep your clients happy—whether you're at your desk or
              on the go.
            </p>
            <Link href={currentUser ? DASHBOARD_ROUTE : AUTH_SIGNIN_ROUTE}>
              <Button variant="outline" size="lg" className="group mt-4 border-border/50 hover:border-primary/30 hover:bg-primary/5 bg-transparent">
                <span>{currentUser ? 'Launch app' : 'Sign In'}</span>
                <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Right Side - Device Screenshots */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            {/* Desktop Screenshot (Bottom Layer) */}
            <div className="relative z-10 ml-auto max-w-[85%] will-change-transform">
              {/* Decorative blur */}
              <div className="absolute -inset-6 bg-primary/10 rounded-2xl blur-3xl opacity-20" />

              <Image
                src="/modern-desktop-dashboard-interface.jpg"
                alt="Desktop interface"
                width={600}
                height={400}
                className="relative rounded-2xl shadow-2xl border border-border/30"
              />
            </div>

            {/* Mobile Screenshot (Top Layer) */}
            <div className="absolute left-0 top-20 z-20 w-[45%] max-w-[250px] will-change-transform hover:scale-105 transition-transform duration-500">
              {/* Decorative blur */}
              <div className="absolute -inset-4 bg-secondary/20 rounded-2xl blur-2xl opacity-30" />

              <Image src="/mobile-app-interface.png" alt="Mobile interface" width={200} height={400} className="relative rounded-2xl shadow-2xl border border-border/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
