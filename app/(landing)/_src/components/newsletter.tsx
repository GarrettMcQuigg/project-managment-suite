'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Input } from '@/packages/lib/components/input';
import { Button } from '@/packages/lib/components/button';
import { Badge } from '@/packages/lib/components/badge';
import { Card, CardContent, CardHeader } from '@/packages/lib/components/card';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      localStorage.setItem('email', email);
      setIsSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section ref={sectionRef} className="py-32 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <Card className="border-border/50 hover:border-primary/30 transition-all duration-500 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center space-y-8 pb-8 pt-12">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 mx-auto">
                Stay Informed
              </Badge>

              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-balance">
                  Join Our
                  <span className="text-primary ml-2">Newsletter</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
                  Be the first to know about exclusive offers, product updates, and industry insights delivered straight to your inbox.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pb-12">
              {/* Email Form */}
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 text-base border-border/50 focus:border-primary/50 bg-background/50"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 px-8 group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    Subscribe
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              ) : (
                <div className="space-y-6 text-center py-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                    <CheckCircle className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">Thank you for signing up!</h3>
                    <p className="text-muted-foreground text-lg">Check your email to confirm your subscription.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
