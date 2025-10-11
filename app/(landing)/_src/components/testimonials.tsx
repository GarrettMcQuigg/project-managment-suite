'use client';

import { Badge } from '@/packages/lib/components/badge';
import { Card, CardContent } from '@/packages/lib/components/card';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO',
    company: 'TechFlow Inc.',
    avatar: '/placeholder.svg?height=60&width=60',
    rating: 5,
    content:
      "This platform transformed our entire workflow. We've seen a 300% increase in productivity and our team collaboration has never been better. The ROI was evident within the first month.",
    metrics: '300% productivity increase'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Operations Director',
    company: 'Global Dynamics',
    avatar: '/placeholder.svg?height=60&width=60',
    rating: 5,
    content:
      'The analytics and reporting features are game-changing. We can now make data-driven decisions in real-time, which has significantly improved our operational efficiency.',
    metrics: '50% faster decision making'
  },
  {
    name: 'Lisa Thompson',
    role: 'Marketing Manager',
    company: 'BrandBoost',
    avatar: '/placeholder.svg?height=60&width=60',
    rating: 5,
    content: 'The collaboration tools have revolutionized how our remote team works together. Projects that used to take weeks now get completed in days.',
    metrics: '60% faster project completion'
  }
];

export function TestimonialsSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(testimonials.length).fill(false));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, index) => {
      if (!card) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setVisibleCards((prev) => {
              const newState = [...prev];
              newState[index] = entry.isIntersecting;
              return newState;
            });
          });
        },
        { threshold: 0.2, rootMargin: '0px' }
      );

      observer.observe(card);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section className="py-32 px-4 relative overflow-hidden cursor-default">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-20">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
            Customer Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-balance">
            Trusted by Industry
            <span className="text-primary block mt-2">Professionals</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Join other successful professionals that have transformed their operations and achieved remarkable growth with our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`transition-all duration-700 ${visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card className="group h-full hover:shadow-xl transition-all duration-500 border-border/50 hover:border-primary/30 hover:-translate-y-1 bg-card/80 backdrop-blur-sm cursor-default">
                <CardContent className="p-8 space-y-6 relative">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-primary/10 absolute top-6 right-6 group-hover:text-primary/20 transition-colors" />

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground leading-relaxed text-pretty">"{testimonial.content}"</p>

                  {/* Metrics Badge */}
                  <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                    {testimonial.metrics}
                  </Badge>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <Image src={testimonial.avatar || '/placeholder.svg'} alt={testimonial.name} width={48} height={48} className="rounded-full ring-2 ring-primary/10" />
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
