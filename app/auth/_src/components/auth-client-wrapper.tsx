'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthClientWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromPricing = searchParams.get('from') === 'pricing';

    if (fromPricing) {
      sessionStorage.setItem('returnToPricing', 'true');
    }
  }, [searchParams]);

  return <>{children}</>;
}
