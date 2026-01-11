'use client';

import { PRIVACY_POLICY_ROUTE, TERMS_OF_SERVICE_ROUTE } from '@/packages/lib/routes';
import Link from 'next/link';

export function LandingPageFooter() {
  return (
    <footer className="relative z-10 flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
      <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Flow Folder. All rights reserved.</p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link className="text-xs hover:underline underline-offset-4" href={TERMS_OF_SERVICE_ROUTE}>
          Terms of Service
        </Link>
        <Link className="text-xs hover:underline underline-offset-4" href={PRIVACY_POLICY_ROUTE}>
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
