'use client';

import React from 'react';
import { format } from 'date-fns';
import { Link2, MessageSquare, Paperclip } from 'lucide-react';
import Link from 'next/link';

interface MessageReferenceProps {
  text: string;
  timestamp: Date | string;
  href: string;
  icon?: 'message' | 'attachment' | 'markup';
}

export default function MessageReference({ text, timestamp, href, icon = 'message' }: MessageReferenceProps) {
  const Icon = icon === 'attachment' ? Paperclip : icon === 'markup' ? Link2 : MessageSquare;

  return (
    <Link href={href} className="block group">
      <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-2 border-primary/20 hover:border-primary/40 hover:from-primary/10 hover:to-primary/15 dark:hover:from-primary/15 dark:hover:to-primary/25 transition-all cursor-pointer shadow-sm hover:shadow-md">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center group-hover:bg-primary/30 dark:group-hover:bg-primary/40 transition-colors">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
            <p className="text-sm sm:text-base text-foreground font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {text}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap self-start">
              {format(new Date(timestamp), "h:mm a',' MMM d")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-primary font-medium">
            <span>View discussion</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
