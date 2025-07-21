import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/packages/lib/providers/providers';
import { cn } from '@/packages/lib/utils';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  preload: false
});

export const metadata: Metadata = {
  title: 'Creative Suite',
  description: 'A platform for creative professionals'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionContext = await getSessionContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', geistSans.variable, sessionContext.type === 'portal' ? 'portal-visitor' : '')} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
