'use client';

import React from 'react';
import { format } from 'date-fns';

interface MessageBubbleMobileProps {
  author: string;
  currentUserName: string;
  timestamp: Date | string;
  message: string;
  avatarInitials: string;
  avatarColor: string;
  attachments?: React.ReactNode;
  className?: string;
}

export default function MessageBubbleMobile({
  author,
  currentUserName,
  timestamp,
  message,
  avatarInitials,
  avatarColor,
  attachments,
  className
}: MessageBubbleMobileProps) {
  const isOwnMessage = author === currentUserName;

  return (
    <div className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${className || ''}`}>
      {/* Avatar - Smaller on mobile */}
      <div className="flex-shrink-0 mb-1">
        <div className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
          {avatarInitials}
        </div>
      </div>

      {/* Message Container */}
      <div className={`flex flex-col ${attachments && !message ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
        {/* Author name - only show for other users */}
        {!isOwnMessage && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-3">
            {author}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl shadow-sm ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-card border border-border text-foreground rounded-bl-md'
          } ${attachments && !message ? 'p-0 overflow-hidden' : 'px-3 py-2'}`}
        >
          {/* Attachments - Full width when no message */}
          {attachments && !message && (
            <div className="w-full">
              {attachments}
            </div>
          )}

          {/* Message Text */}
          {message && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message}
            </p>
          )}

          {/* Attachments - With padding when there's a message */}
          {attachments && message && (
            <div className="mt-2">
              {attachments}
            </div>
          )}

          {/* Timestamp - Inside bubble on mobile */}
          <div className={`flex items-center justify-end ${attachments && !message ? 'px-2 pb-1 pt-1 bg-black/20' : 'mt-1'}`}>
            <span className={`text-xs ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {format(new Date(timestamp), 'h:mm a')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
