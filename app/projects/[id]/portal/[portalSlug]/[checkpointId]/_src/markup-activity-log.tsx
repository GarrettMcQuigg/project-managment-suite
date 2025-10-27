'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Pencil, Highlighter, Square, Send } from 'lucide-react';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { API_PROJECT_CHECKPOINT_MARKUPS_COMMENTS_CREATE_ROUTE } from '@/packages/lib/routes';
import { toast } from 'react-toastify';
import type { ProjectMessageAttachment } from '@prisma/client';
import MessageBubble from '../../../../../../../packages/lib/components/message-bubble';

interface MarkupActivityLogProps {
  attachment: ProjectMessageAttachment;
  markups: any[];
  generalComments: any[];
  projectId: string;
  checkpointId: string;
  isOwner: boolean;
  loading: boolean;
  isInitialLoading: boolean;
  currentUserName: string;
  focusedCommentId?: string | null;
  onCommentFocus?: (markupId: string | null) => void;
}

export default function MarkupActivityLog({ attachment, markups, generalComments, isOwner, loading, isInitialLoading, currentUserName, focusedCommentId, onCommentFocus }: MarkupActivityLogProps) {
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const commentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Combine server comments with optimistic local comments
  const allComments = [
    ...markups.filter((m) => m.type === 'COMMENT'),
    ...generalComments.map((comment) => ({
      id: comment.id,
      type: 'MESSAGE' as const,
      createdAt: comment.createdAt,
      userId: comment.userId,
      name: comment.name,
      comments: [{ text: comment.text }]
    })),
    ...optimisticComments
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Remove optimistic comments when real server versions arrive
  useEffect(() => {
    if (optimisticComments.length === 0) return;

    const serverCommentTexts = generalComments.map((c) => c.text.trim().toLowerCase());

    // Filter out optimistic comments that now exist in server data
    setOptimisticComments((prev) =>
      prev.filter((optimistic) => {
        const optimisticText = optimistic.comments[0].text.trim().toLowerCase();
        const existsOnServer = serverCommentTexts.includes(optimisticText);

        // If it exists on server, check if it was created recently (within last 10 seconds)
        // to avoid removing old optimistic comments that happen to have same text
        if (existsOnServer) {
          const optimisticTime = new Date(optimistic.createdAt).getTime();
          const now = Date.now();
          const wasRecentlyCreated = now - optimisticTime < 10000; // 10 seconds

          // Remove if it was recently created and now exists on server
          return !wasRecentlyCreated;
        }

        return true; // Keep if not on server yet
      })
    );
  }, [generalComments]);

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [allComments.length]);

  // Scroll to focused comment when it changes
  useEffect(() => {
    if (focusedCommentId && commentRefs.current.has(focusedCommentId)) {
      const element = commentRefs.current.get(focusedCommentId);
      if (element && scrollContainerRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedCommentId]);

  const getMarkupIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return MessageSquare;
      case 'MESSAGE':
        return MessageSquare;
      case 'DRAWING':
        return Pencil;
      case 'HIGHLIGHT':
        return Highlighter;
      case 'SHAPE':
        return Square;
      default:
        return MessageSquare;
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || sendingComment) return;

    const commentText = newComment.trim();
    const optimisticId = `temp-${Date.now()}`;

    // Create optimistic comment
    const optimisticComment = {
      id: optimisticId,
      type: 'MESSAGE' as const,
      createdAt: new Date().toISOString(),
      userId: isOwner ? 'current-user' : null,
      name: currentUserName,
      comments: [{ text: commentText }]
    };

    // Add optimistic comment immediately
    setOptimisticComments((prev) => [...prev, optimisticComment]);
    setNewComment('');
    setSendingComment(true);

    try {
      const response = await fetcher({
        url: API_PROJECT_CHECKPOINT_MARKUPS_COMMENTS_CREATE_ROUTE,
        requestBody: {
          attachmentId: attachment.id,
          text: commentText
        }
      });

      if (response.err) {
        toast.error('Failed to send comment');
        // Remove optimistic comment on error
        setOptimisticComments((prev) => prev.filter((c) => c.id !== optimisticId));
        setNewComment(commentText); // Restore the text
        return;
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      toast.error('An error occurred while sending your comment');
      // Remove optimistic comment on error
      setOptimisticComments((prev) => prev.filter((c) => c.id !== optimisticId));
      setNewComment(commentText); // Restore the text
    } finally {
      setSendingComment(false);
    }
  };

  // Generate consistent color for each comment based on its ID
  const getCommentColor = (commentId: string): string => {
    const colors = [
      '#6366f1', // indigo
      '#3b82f6', // blue
      '#10b981', // green
      '#eab308', // yellow
      '#f59e0b', // amber
      '#ef4444', // red
      '#ec4899', // pink
      '#f97316', // orange
      '#a855f7'  // purple
    ];
    const hash = commentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getAvatarData = (author: string) => {
    // Handle single-segment names (e.g., "John") and multi-segment names (e.g., "John Doe")
    const nameParts = author
      .trim()
      .split(' ')
      .filter((part) => part.length > 0);
    let initials: string;

    if (nameParts.length === 0) {
      // Fallback for empty names
      initials = '?';
    } else if (nameParts.length === 1) {
      // Single segment: take first 2 characters (e.g., "John" -> "JO")
      initials = nameParts[0].slice(0, 2).toUpperCase();
    } else {
      // Multiple segments: take first letter of first 2 parts (e.g., "John Doe" -> "JD")
      initials = nameParts
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }

    // Generate consistent color based on name
    const colors = [
      'bg-indigo-500/80',
      'bg-blue-500/80',
      'bg-green-500/80',
      'bg-yellow-500/80',
      'bg-amber-500/80',
      'bg-red-500/80',
      'bg-pink-500/80',
      'bg-orange-500/80',
      'bg-purple-500/80'
    ];
    const colorIndex = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

    return {
      initials,
      color: author === currentUserName ? 'bg-primary' : colors[colorIndex]
    };
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border px-6 h-16 flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-foreground">Activity</h3>
        <span className="text-sm text-muted-foreground">
          {allComments.length} {allComments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loading && isInitialLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allComments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No comments yet</p>
          </div>
        ) : (
          allComments.map((item) => {
            if (!item.comments || item.comments.length === 0) return null;

            const Icon = getMarkupIcon(item.type);
            const author = item.name;
            const avatarData = getAvatarData(author);
            const isComment = item.type === 'COMMENT';
            const isFocused = isComment && focusedCommentId === item.id;
            const borderColor = isComment ? getCommentColor(item.id) : undefined;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  if (el && isComment) {
                    commentRefs.current.set(item.id, el);
                  }
                }}
              >
                <MessageBubble
                  author={author}
                  currentUserName={currentUserName}
                  timestamp={item.createdAt}
                  message={item.comments[0].text}
                  avatarInitials={avatarData.initials}
                  avatarColor={avatarData.color}
                  icon={Icon}
                  borderColor={borderColor}
                  isFocused={isFocused}
                  isClickable={isComment}
                  onClick={isComment ? () => onCommentFocus?.(isFocused ? null : item.id) : undefined}
                />
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border flex-shrink-0 px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendComment();
            }}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={sendingComment}
          />
          <button
            onClick={handleSendComment}
            disabled={sendingComment || !newComment.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[44px]"
          >
            {sendingComment ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
