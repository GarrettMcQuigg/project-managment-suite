'use client';

import React, { useState } from 'react';
import { MessageSquare, Pencil, Highlighter, Square, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { API_PROJECT_CHECKPOINT_MARKUPS_COMMENTS_CREATE_ROUTE } from '@/packages/lib/routes';
import { toast } from 'react-toastify';
import type { ProjectMessageAttachment } from '@prisma/client';

interface MarkupActivityLogProps {
  attachment: ProjectMessageAttachment;
  markups: any[];
  projectId: string;
  checkpointId: string;
  isOwner: boolean;
  loading: boolean;
  onMarkupDeleted: (markupId: string) => void;
  onRefresh: () => void;
}

export default function MarkupActivityLog({
  attachment,
  markups,
  projectId,
  checkpointId,
  isOwner,
  loading,
  onMarkupDeleted,
  onRefresh
}: MarkupActivityLogProps) {
  const [subchatExpanded, setSubchatExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const getMarkupIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
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

    setSendingComment(true);
    try {
      const response = await fetcher({
        url: API_PROJECT_CHECKPOINT_MARKUPS_COMMENTS_CREATE_ROUTE,
        requestBody: {
          attachmentId: attachment.id,
          text: newComment
        }
      });

      if (response.err) {
        toast.error('Failed to send comment');
        return;
      }

      setNewComment('');
      toast.success('Comment sent successfully');
      onRefresh();
    } catch (error) {
      console.error('Error sending comment:', error);
      toast.error('An error occurred while sending your comment');
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Activity Log Header */}
      <div className="border-b border-border p-4 flex-shrink-0">
        <h3 className="font-semibold text-foreground">Activity Log</h3>
        <p className="text-sm text-muted-foreground">
          {markups.length} markup{markups.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Markups List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : markups.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No markups yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Use the tools above to add annotations
            </p>
          </div>
        ) : (
          markups.map((markup) => {
            const Icon = getMarkupIcon(markup.type);
            const author = markup.userId ? 'You' : markup.visitorName || 'Anonymous';

            return (
              <div
                key={markup.id}
                className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Icon className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{author}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(markup.createdAt), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{markup.type.toLowerCase()}</p>
                    {markup.type === 'COMMENT' && markup.comments && markup.comments.length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-foreground">
                        {markup.comments[0].text}
                      </div>
                    )}
                    {markup.type !== 'COMMENT' && markup.comments && markup.comments.length > 0 && (
                      <div className="mt-2 text-xs text-primary">
                        {markup.comments.length} comment{markup.comments.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sub-Chat Panel */}
      <div className="border-t border-border flex-shrink-0">
        <button
          onClick={() => setSubchatExpanded(!subchatExpanded)}
          className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <span className="font-medium text-sm text-foreground">Discussion</span>
          {subchatExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {subchatExpanded && (
          <div className="border-t border-border p-3 space-y-3">
            {/* Comment Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendComment();
                }}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 rounded-lg border border-input focus:border-ring focus:outline-none bg-background text-foreground placeholder-muted-foreground text-sm"
                disabled={sendingComment}
              />
              <button
                onClick={handleSendComment}
                disabled={sendingComment || !newComment.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingComment ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Comments List Placeholder */}
            <div className="text-xs text-muted-foreground text-center py-2">
              General file discussion appears here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
