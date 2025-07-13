'use client';

import { ABOUT_US_ROUTE, AUTH_SIGNIN_ROUTE, DASHBOARD_ROUTE, FEATURES_ROUTE, PRICING_ROUTE, ROOT_ROUTE } from '@/packages/lib/routes';
import { MoonIcon, Palette, Rocket, SunIcon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { User } from '@prisma/client';

export default function LandingHeader({ currentUser }: { currentUser: User | null }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-transparent dark:bg-gray-900/5 backdrop-blur-md" />
      <div className="relative flex items-center justify-between w-full max-w-7xl h-header p-4 mx-auto">
        <Link href={ROOT_ROUTE} className="flex items-center gap-2 font-bold sm:text-2xl text-lg text-black dark:text-white">
          <Palette className="h-6 w-6" /> <span className="flex gap-1">Solira</span>
        </Link>
        <nav className="flex items-center md:block hidden space-x-12">
          <a href={ABOUT_US_ROUTE} className="text-sm text-black dark:text-white hover:opacity-75 transition-opacity">
            About Us
          </a>
          <a href={FEATURES_ROUTE} className="text-sm text-black dark:text-white hover:opacity-75 transition-opacity">
            Features
          </a>
          <Link href={PRICING_ROUTE} className="text-sm text-black dark:text-white hover:opacity-75 transition-opacity">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center space-x-8">
          <Link
            className="flex items-center gap-2 bg-foreground text-background text-sm px-4 py-2 rounded-3xl hover:opacity-90 transition-opacity"
            href={currentUser ? DASHBOARD_ROUTE : AUTH_SIGNIN_ROUTE}
          >
            <span>
              {currentUser ? (
                <span className="flex gap-1">
                  Launch <span className="sm:block hidden">App</span>
                </span>
              ) : (
                'Sign In'
              )}
            </span>{' '}
            <Rocket className="h-4 w-4" />
          </Link>

          <button
              type="button"
              className="bg-transparent cursor-pointer sm:block hidden"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="transition-all duration-200 hover:scale-110">
                {theme === 'dark' ? (
                  <MoonIcon className="h-5 w-5 text-white hover:text-gray-200 transition-colors duration-200" aria-hidden="true" />
                ) : (
                  <SunIcon className="h-5 w-5 text-black hover:text-gray-800 transition-colors duration-200" aria-hidden="true" />
                )}
              </div>
            </button>
        </div>
      </div>
    </header>
  );
}
