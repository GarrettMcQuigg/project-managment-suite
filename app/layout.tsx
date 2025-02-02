import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/packages/lib/providers/providers';
import { cn } from '@/packages/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Creative Suite',
  description: 'A platform for creative professionals'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', geistSans.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
