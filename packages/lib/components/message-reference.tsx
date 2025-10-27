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
      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted hover:border-border transition-all cursor-pointer">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm text-foreground/90 font-medium group-hover:text-foreground transition-colors">
              {text}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(new Date(timestamp), "h:mm a',' MMM d")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary group-hover:underline">
            <span>View discussion</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
