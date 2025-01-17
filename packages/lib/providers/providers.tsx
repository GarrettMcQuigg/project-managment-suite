'use client';

import React from 'react';
import { ThemeProvider } from './theme';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NextTopLoader from 'nextjs-toploader';
import { TooltipProvider } from '@/packages/lib/components/tooltip';
import LoadingProvider from './loading';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <SpeedInsights />
      <LoadingProvider>
        <NextTopLoader color="#2299DD" initialPosition={0.08} showSpinner={false} height={3} shadow="0 0 10px #2299DD,0 0 5px #2299DD" />

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />

        <TooltipProvider>{children}</TooltipProvider>

        <Analytics />
      </LoadingProvider>
    </ThemeProvider>
  );
}
