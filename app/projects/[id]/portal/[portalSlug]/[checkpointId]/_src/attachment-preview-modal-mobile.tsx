'use client';

import React, { useState, useEffect } from 'react';
import { X, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { API_PROJECT_CHECKPOINT_MARKUPS_LIST_ROUTE } from '@/packages/lib/routes';
import type { AttachmentMarkup, ProjectMessageAttachment } from '@prisma/client';
import Image from 'next/image';

interface AttachmentPreviewModalMobileProps {
  attachment: ProjectMessageAttachment;
  onClose: () => void;
}

export default function AttachmentPreviewModalMobile({ attachment, onClose }: AttachmentPreviewModalMobileProps) {
  const [showMarkups, setShowMarkups] = useState(true);
  const [markups, setMarkups] = useState<AttachmentMarkup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToolMenu, setShowToolMenu] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const fileName = attachment.pathname.split('/').pop() || 'File';
  const fileType = attachment.contentType;
  const isImage = fileType.startsWith('image/');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadMarkups();
  }, [attachment.id]);

  const loadMarkups = async () => {
    try {
      setLoading(true);
      const data = await swrFetcher(`${API_PROJECT_CHECKPOINT_MARKUPS_LIST_ROUTE}?attachmentId=${attachment.id}`);
      setMarkups(data.content.markups || []);
    } catch (error) {
      console.error('Error loading markups:', error);
      setMarkups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col touch-none" onClick={onClose}>
      <div className="relative bg-background h-full w-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Header - Compact */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/95 backdrop-blur flex-shrink-0">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-semibold text-foreground truncate text-sm">{fileName}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {markups.length} markup{markups.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* 3-Dots Menu Button */}
            <button onClick={() => setShowToolMenu(!showToolMenu)} className="p-2 hover:bg-muted rounded-lg transition-colors relative" aria-label="Options">
              <MoreVertical className="h-5 w-5 text-foreground" />
            </button>

            {/* Close Button */}
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Close">
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Tools Menu Dropdown */}
        {showToolMenu && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setShowToolMenu(false)} />

            {/* Menu */}
            <div className="absolute top-12 right-2 bg-card border border-border rounded-lg shadow-2xl z-50 min-w-[200px] overflow-hidden">
              <button
                onClick={() => {
                  setShowMarkups(!showMarkups);
                  setShowToolMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b border-border"
              >
                {showMarkups ? <EyeOff className="h-5 w-5 text-foreground" /> : <Eye className="h-5 w-5 text-foreground" />}
                <span className="text-sm font-medium text-foreground">{showMarkups ? 'Hide Markups' : 'Show Markups'}</span>
              </button>

              <button
                onClick={() => {
                  handleZoomIn();
                  setShowToolMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                <span className="text-sm font-medium text-foreground">Zoom In</span>
              </button>

              <button
                onClick={() => {
                  handleZoomOut();
                  setShowToolMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
                <span className="text-sm font-medium text-foreground">Zoom Out</span>
              </button>

              <button
                onClick={() => {
                  handleResetZoom();
                  setShowToolMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-t border-border"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-sm font-medium text-foreground">Reset View</span>
              </button>
            </div>
          </>
        )}

        {/* Image Viewer - Mobile Optimized */}
        <div className="flex-1 overflow-hidden relative bg-black/95">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <div
                className="relative transition-transform duration-200"
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center center'
                }}
              >
                <Image src={attachment.blobUrl} alt={fileName} width={1200} height={900} className="max-w-full h-auto object-contain" style={{ maxHeight: '80vh' }} priority />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Preview Not Available</h3>
                <p className="text-sm text-muted-foreground mb-4">This file type cannot be previewed on mobile.</p>
                <a
                  href={attachment.blobUrl}
                  download={fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Zoom Controls - Floating Bottom */}
        {isImage && !loading && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-card/95 backdrop-blur border border-border rounded-full px-3 py-2 shadow-lg">
            <button onClick={handleZoomOut} className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Zoom out">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <span className="text-sm font-medium text-foreground min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>

            <button onClick={handleZoomIn} className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Zoom in">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
