'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Pencil, Highlighter, Square, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { API_PROJECT_CHECKPOINT_MARKUPS_COMMENTS_CREATE_ROUTE } from '@/packages/lib/routes';
import { toast } from 'react-toastify';
import type { ProjectMessageAttachment } from '@prisma/client';

interface MarkupActivityLogProps {
  attachment: ProjectMessageAttachment;
  markups: any[];
  generalComments: any[];
  projectId: string;
  checkpointId: string;
  isOwner: boolean;
  loading: boolean;
  ownerName: string;
}

export default function MarkupActivityLog({ attachment, markups, generalComments, isOwner, loading, ownerName }: MarkupActivityLogProps) {
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Combine server comments with optimistic local comments
  const allComments = [
    ...markups.filter((m) => m.type === 'COMMENT'),
    ...generalComments.map((comment) => ({
      id: comment.id,
      type: 'MESSAGE' as const,
      createdAt: comment.createdAt,
      userId: comment.userId,
      visitorName: comment.visitorName,
      comments: [{ text: comment.text }]
    })),
    ...optimisticComments
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [allComments.length]);

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
      visitorName: isOwner ? null : 'You',
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

      toast.success('Comment sent successfully');
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

  const getAvatarData = (author: string, isOwn: boolean) => {
    if (isOwn) author = ownerName;
    const initials = author
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Generate consistent color based on name
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500'];
    const colorIndex = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

    return {
      initials,
      color: isOwn ? 'bg-primary' : colors[colorIndex]
    };
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Activity</h3>
          <span className="text-sm text-muted-foreground">
            {allComments.length} {allComments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loading ? (
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
            const Icon = getMarkupIcon(item.type);
            const author = item.userId ? 'You' : item.visitorName || 'Anonymous';
            const isOwn = isOwner && item.userId;
            const avatarData = getAvatarData(author, isOwn);

            return (
              <div key={item.id} className="group flex gap-3 -mx-2 px-2 py-2 rounded-lg transition-colors">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full ${avatarData.color} flex items-center justify-center text-white text-xs font-semibold shadow-sm`}>
                    {avatarData.initials}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {/* Header row */}
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-semibold text-sm text-foreground">{author}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "h:mm a',' MMM d")}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                      <Icon className="h-2.5 w-2.5" />
                      {item.type === 'MESSAGE' ? 'message' : item.type.toLowerCase()}
                    </span>
                  </div>

                  {/* Comment bubble */}
                  {item.comments && item.comments.length > 0 && (
                    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all break-words cursor-default">
                      <p className="text-sm text-foreground leading-relaxed">{item.comments[0].text}</p>
                    </div>
                  )}
                </div>
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
