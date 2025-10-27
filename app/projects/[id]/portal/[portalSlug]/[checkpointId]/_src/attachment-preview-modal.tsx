'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CanvasViewer from './canvas-viewer';
import MarkupActivityLog from './markup-activity-log';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { API_PROJECT_CHECKPOINT_MARKUPS_LIST_ROUTE } from '@/packages/lib/routes';
import type { ProjectMessageAttachment } from '@prisma/client';

interface AttachmentPreviewModalProps {
  attachment: ProjectMessageAttachment;
  projectId: string;
  checkpointId: string;
  isOwner: boolean;
  ownerName: string;
  currentUserName: string;
  onClose: () => void;
  initialFocusedMarkupId?: string | null;
  onCommentCreated?: () => void;
}

export default function AttachmentPreviewModal({ attachment, projectId, checkpointId, isOwner, ownerName, currentUserName, onClose, initialFocusedMarkupId, onCommentCreated }: AttachmentPreviewModalProps) {
  const [showMarkups, setShowMarkups] = useState(true);
  const [markups, setMarkups] = useState<any[]>([]);
  const [generalComments, setGeneralComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [focusedCommentId, setFocusedCommentId] = useState<string | null>(initialFocusedMarkupId || null);

  const fileName = attachment.pathname.split('/').pop() || 'File';
  const fileType = attachment.contentType;

  // Smart polling with visibility API and inactivity detection
  useEffect(() => {
    loadMarkups();

    let pollInterval: NodeJS.Timeout;
    let lastInteractionTime = Date.now();
    let currentPollInterval = 3000; // Track current interval

    // Track user interactions to reset inactivity timer
    const resetInactivityTimer = () => {
      const wasInactive = Date.now() - lastInteractionTime > 60000;
      lastInteractionTime = Date.now();

      // If we were inactive and just became active, restart polling at 3s interval
      if (wasInactive && currentPollInterval === 15000) {
        startPolling();
      }
    };

    // Function to start polling with appropriate interval
    const startPolling = () => {
      clearInterval(pollInterval);

      const timeSinceLastInteraction = Date.now() - lastInteractionTime;
      const isInactive = timeSinceLastInteraction > 60000;
      currentPollInterval = isInactive ? 15000 : 3000;

      pollInterval = setInterval(() => {
        // Check inactivity on every poll
        const timeSinceInteraction = Date.now() - lastInteractionTime;
        const shouldBeInactive = timeSinceInteraction > 60000;

        // If inactivity status changed, restart polling with new interval
        if (shouldBeInactive && currentPollInterval === 3000) {
          // Just became inactive - switch to slow polling
          startPolling();
          return;
        } else if (!shouldBeInactive && currentPollInterval === 15000) {
          // Just became active - switch to fast polling
          startPolling();
          return;
        }

        // Only poll if tab is visible
        if (!document.hidden) {
          loadMarkups(false);
        }
      }, currentPollInterval);
    };

    // Event listeners for user interaction (use capture phase to catch all events)
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'input', 'focus'];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true, capture: true });
    });

    // Check visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible - fetch immediately and resume polling
        lastInteractionTime = Date.now(); // Reset timer when tab becomes visible
        loadMarkups(false);
        startPolling();
      } else {
        // Tab hidden - stop polling to save resources
        clearInterval(pollInterval);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start initial polling
    startPolling();

    // Clean up on unmount
    return () => {
      clearInterval(pollInterval);
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [attachment.id]);

  const loadMarkups = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      const data = await swrFetcher(`${API_PROJECT_CHECKPOINT_MARKUPS_LIST_ROUTE}?attachmentId=${attachment.id}`);
      setMarkups(data.content.markups || []);
      setGeneralComments(data.content.generalComments || []);
      setIsInitialLoading(false);
    } catch (error) {
      console.error('Error loading markups:', error);
      setMarkups([]);
      setGeneralComments([]);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  const handleMarkupCreated = (newMarkup: any) => {
    setMarkups((prev) => [...prev, newMarkup]);
  };

  const handleMarkupDeleted = (markupId: string) => {
    setMarkups((prev) => prev.filter((m) => m.id !== markupId));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative bg-card rounded-2xl shadow-2xl w-full h-[90vh] max-w-[95vw] overflow-hidden border border-border flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-bold text-foreground truncate">{fileName}</h3>
              <p className="text-sm text-muted-foreground">
                {fileType} • {markups.length} markup{markups.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Save Status Indicator */}
          <div>
            {saveStatus !== 'saved' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-xs">
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-muted-foreground">Unsaved changes</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMarkups(!showMarkups)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                showMarkups ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {showMarkups ? 'Hide' : 'Show'} Markups
            </button>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Main Content - 70/30 Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Section - 70% */}
          <div className="flex-[0_0_70%] border-r border-border">
            <CanvasViewer
              attachment={attachment}
              markups={markups}
              showMarkups={showMarkups}
              isOwner={isOwner}
              currentUserName={currentUserName}
              focusedCommentId={focusedCommentId}
              onMarkupCreated={handleMarkupCreated}
              onMarkupDeleted={handleMarkupDeleted}
              onMarkupsUpdated={loadMarkups}
              onCommentFocus={setFocusedCommentId}
              onSaveStatusChange={setSaveStatus}
            />
          </div>

          {/* Activity Log - 30% */}
          <div className="flex-[0_0_30%] overflow-hidden">
            <MarkupActivityLog
              attachment={attachment}
              markups={markups}
              generalComments={generalComments}
              projectId={projectId}
              checkpointId={checkpointId}
              isOwner={isOwner}
              loading={loading}
              isInitialLoading={isInitialLoading}
              currentUserName={currentUserName}
              focusedCommentId={focusedCommentId}
              onCommentFocus={setFocusedCommentId}
              onCommentCreated={onCommentCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
