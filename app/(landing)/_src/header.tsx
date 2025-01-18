'use client';

import { AUTH_CHECKPOINT_ROUTE } from '@/packages/lib/routes';
import { MoonIcon, Rocket, SunIcon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { user } from '@prisma/client';

export default function LandingHeader({ currentUser }: { currentUser: user | null }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between w-full max-w-7xl h-header p-4 mx-auto">
      <a href="/" className="font-bold text-2xl text-primary">
        Hot & Sexy CRM for Creatives
      </a>
      <nav className="flex items-center space-x-4">
        <a href="/about-us" className="text-sm text-primary">
          About Us
        </a>
        <a href="/pricing" className="text-sm text-primary">
          Pricing
        </a>
        <a href="/terms-of-service" className="text-sm text-primary">
          Terms of Service
        </a>
        <a href="/privacy-policy" className="text-sm text-primary">
          Privacy Policy
        </a>
      </nav>
      <div className="flex items-center space-x-8">
        <Link className="flex items-center gap-2 bg-foreground text-background text-sm px-4 py-2 rounded-3xl" href={AUTH_CHECKPOINT_ROUTE}>
          <span>{currentUser ? 'Launch App' : 'Sign In'}</span> <Rocket className="h-4 w-4" />
        </Link>

        {/* Theme */}
        <div className="bg-background cursor-pointer" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <div className="transition-all duration-200 hover:scale-110">
            {theme === 'dark' ? (
              <MoonIcon className="h-5 w-5 text-gray-300 hover:text-gray-100 transition-colors duration-200" aria-hidden="true" />
            ) : (
              <SunIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
