import React from 'react';
import { cn } from '../utils';

export default function PageContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('max-w-7xl px-4 py-6 sm:p-6 lg:p-8', className)}>{children}</section>;
}
