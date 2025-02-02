'use client';

// import Image from 'next/image';
import Link from 'next/link';
import { Zap, Users, Calendar } from 'lucide-react';
import CustomBackground from '@/packages/lib/components/custom-background';
import { Card, CardContent } from '@/packages/lib/components/card';
import { Button } from '@/packages/lib/components/button';
import { Input } from '@/packages/lib/components/input';
import LandingHeader from './header';
import { useEffect } from 'react';
import { User } from '@prisma/client';

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
        <AppShowcaseSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <footer className="relative z-10 flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 CreativeSuite CRM. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Unleash Your Creative Potential with CreativeSuite CRM</h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Streamline your workflow, manage clients, and boost productivity. The ultimate CRM designed for creatives, by creatives.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="bg-primary/70 text-white hover:bg-primary/90">Get Started</Button>
              <Button variant="outline">Watch Demo</Button>
            </div>
          </div>
          <div className="relative w-[600px] h-[400px] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <div className="absolute inset-0">
              {/* <Image src="/images/landing/landing-page-stock-img.jpg" fill priority alt="Background" className="object-cover" /> */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppShowcaseSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Designed for Creatives</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <Zap className="h-12 w-12 text-foreground" />
              <h3 className="text-xl font-bold">Intuitive Interface</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">Designed with creatives in mind, our interface is as beautiful as it is functional.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <Users className="h-12 w-12 text-foreground" />
              <h3 className="text-xl font-bold">Client Management</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">Keep track of clients, projects, and communications all in one place.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <Calendar className="h-12 w-12 text-foreground" />
              <h3 className="text-xl font-bold">Project Timelines</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">Visualize project timelines and never miss a deadline again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Loved by Creatives</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              name: 'Alex Johnson',
              role: 'Freelance Designer',
              content: "CreativeSuite CRM has transformed how I manage my freelance business. It's intuitive and powerful!"
            },
            {
              name: 'Sarah Lee',
              role: 'Creative Agency Owner',
              content: "This CRM understands the unique needs of creative professionals. It's a game-changer for our agency."
            },
            {
              name: 'Mike Chen',
              role: 'Photographer',
              content: 'I can focus more on my art now that CreativeSuite CRM handles the business side of things. Highly recommended!'
            }
          ].map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col space-y-2 p-6">
                <p className="text-gray-500 dark:text-gray-400">"{testimonial.content}"</p>
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-gray-300 w-10 h-10" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Stay in the Creative Loop</h2>
            <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Subscribe to our newsletter for the latest CRM features, creative tips, and exclusive offers.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <form className="flex space-x-2">
              <Input className="max-w-lg flex-1" placeholder="Enter your email" type="email" />
              <Button type="submit">Subscribe</Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
