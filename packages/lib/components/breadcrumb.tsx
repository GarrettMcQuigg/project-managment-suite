'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type BreadcrumbProps = {
  href: string;
};

export function Breadcrumb({ href }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-4">
      <Link href={href}>
        <ArrowLeft className="cursor-pointer" />
      </Link>
    </div>
  );
}
