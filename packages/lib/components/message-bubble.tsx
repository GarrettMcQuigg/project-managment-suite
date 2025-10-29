'use client';

import React from 'react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  author: string;
  currentUserName: string;
  timestamp: Date | string;
  message: string;
  avatarInitials: string;
  avatarColor: string;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
  borderColor?: string;
  isFocused?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  attachments?: React.ReactNode;
  className?: string;
}

export default function MessageBubble({
  author,
  currentUserName,
  timestamp,
  message,
  avatarInitials,
  avatarColor,
  type,
  icon: Icon,
  borderColor,
  isFocused,
  isClickable,
  onClick,
  attachments,
  className
}: MessageBubbleProps) {
  const isOwnMessage = author === currentUserName;

  return (
    <div className={`flex items-start gap-2.5 ${isOwnMessage ? 'flex-row-reverse' : ''} ${isClickable ? 'cursor-pointer' : ''} ${className || ''}`} onClick={onClick}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold shadow-sm`}>{avatarInitials}</div>
      </div>

      {/* Message Container */}
      <div
        className={`flex flex-col w-full max-w-[320px] leading-relaxed p-4 border-2 shadow-sm transition-all ${
          isOwnMessage ? 'rounded-s-xl rounded-ee-xl text-foreground bg-primary/10 dark:bg-primary/20' : 'rounded-e-xl rounded-es-xl bg-muted/50 dark:bg-card/50'
        } ${isFocused ? 'ring-2 ring-offset-2 scale-[1.02]' : ''} ${isClickable ? 'hover:shadow-md hover:scale-[1.01]' : ''}`}
        style={{
          borderColor: borderColor || 'hsl(var(--border))',
          ...(isFocused && borderColor ? { ringColor: borderColor } : {})
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <span className="sm:text-sm text-xs font-semibold text-foreground">{author}</span>
          <span className="text-xs text-muted-foreground">{format(new Date(timestamp), "h:mm a',' MMM d")}</span>
          {type && Icon && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground ml-auto">
              <Icon className="h-2.5 w-2.5" />
              {type}
            </span>
          )}
        </div>

        {/* Message */}
        {message && <p className="text-sm text-foreground py-1 break-words">{message}</p>}

        {/* Attachments */}
        {attachments && <div className={`${message ? 'mt-2' : ''}`}>{attachments}</div>}
      </div>
    </div>
  );
}
