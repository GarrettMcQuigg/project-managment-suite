'use client';

import { Badge } from '@/packages/lib/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/lib/components/card';
import { FEATURES_ROUTE } from '@/packages/lib/routes';
import { BarChart3, Shield, Zap, Users, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get deep insights into your business performance with real-time analytics.',
    benefits: ['Real-time data tracking', 'Predictive analytics', 'Export capabilities']
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Top-level security with end-to-end encryption and advanced threat protection.',
    benefits: ['Encrypted data storage', 'Multi-factor authentication', 'Secure access controls']
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Experience blazing-fast performance with our optimized interface designed for creative workflows.',
    benefits: ['Quick project access', 'Responsive interface', 'Fast file previews', 'Efficient search capabilities']
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Seamlessly collaborate with your team using built-in tools and workflow management.',
    benefits: ['Real-time collaboration', 'Role-based permissions', 'Activity tracking', 'Integration with popular tools']
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimization',
    description: 'Access your business from anywhere, anytime, on any device with our fully responsive design.',
    benefits: ['Fully responsive design', 'Web and Mobile capabilities', 'Push notifications', 'Touch-optimized interface']
  }
];

export function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(features.length).fill(false));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, index) => {
      if (!card) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
      );

      observer.observe(card);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section className="py-32 sm:px-4 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-20">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
            Features & Benefits
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-balance">
            Everything You Need to
            <span className="text-primary block mt-2">Scale Your Business</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Our comprehensive platform provides all the tools and features you need to grow, manage, and optimize your business operations efficiently.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto">
          {/* First row - 3 cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {features.slice(0, 3).map((feature, index) => (
              <div
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`transition-all duration-700 ${visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card className="group h-full hover:shadow-xl transition-all duration-500 border-border/50 hover:border-primary/30 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 border border-primary/10">
                        <feature.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="px-6 pb-4">
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </div>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Second row - 2 cards centered */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 md:max-w-4xl mx-auto">
            {features.slice(3, 5).map((feature, index) => (
              <div
                key={index + 3}
                ref={(el) => {
                  cardRefs.current[index + 3] = el;
                }}
                className={`transition-all duration-700 ${visibleCards[index + 3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card className="group h-full hover:shadow-xl transition-all duration-500 border-border/50 hover:border-primary/30 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="space-y-4 pb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 border border-primary/10">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <Link href={FEATURES_ROUTE} className="inline-flex items-center gap-2 text-primary hover:gap-4 transition-all duration-300 cursor-pointer group text-lg font-medium">
            <span>Explore all features</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
