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
}

export default function MessageBubble({ author, currentUserName, timestamp, message, avatarInitials, avatarColor, type, icon: Icon }: MessageBubbleProps) {
  const isOwnMessage = author === currentUserName;

  return (
    <div className={`flex items-start gap-2.5 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold shadow-sm`}>{avatarInitials}</div>
      </div>

      {/* Message Container */}
      <div
        className={`flex flex-col w-full max-w-[320px] leading-relaxed p-4 border border-border shadow-sm ${
          isOwnMessage ? 'rounded-s-xl rounded-ee-xl text-foreground' : 'rounded-e-xl rounded-es-xl bg-gray-300/30 dark:bg-card/50'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-foreground">{author}</span>
          <span className="text-xs text-muted-foreground">{format(new Date(timestamp), "h:mm a',' MMM d")}</span>
          {type && Icon && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground ml-auto">
              <Icon className="h-2.5 w-2.5" />
              {type}
            </span>
          )}
        </div>

        {/* Message */}
        <p className="text-sm text-foreground py-1 break-words">{message}</p>
      </div>
    </div>
  );
}
