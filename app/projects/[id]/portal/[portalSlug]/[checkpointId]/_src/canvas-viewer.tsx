'use client';

import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import CanvasToolbar from './canvas-toolbar';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { API_PROJECT_CHECKPOINT_MARKUPS_CREATE_ROUTE, API_PROJECT_CHECKPOINT_MARKUPS_DELETE_ROUTE, API_PROJECT_CHECKPOINT_MARKUPS_COMMENTS_CREATE_ROUTE } from '@/packages/lib/routes';
import { toast } from 'react-toastify';
import type { ProjectMessageAttachment } from '@prisma/client';

type ToolType = 'select' | 'comment' | 'draw' | 'highlight' | 'rectangle' | 'circle' | 'arrow';

interface CanvasViewerProps {
  attachment: ProjectMessageAttachment;
  markups: any[];
  showMarkups: boolean;
  isOwner: boolean;
  onMarkupCreated: (markup: any) => void;
  onMarkupDeleted: (markupId: string) => void;
  onMarkupsUpdated: () => void;
}

interface Point {
  x: number;
  y: number;
}

export default function CanvasViewer({
  attachment,
  markups,
  showMarkups,
  isOwner,
  onMarkupCreated,
  onMarkupDeleted,
  onMarkupsUpdated
}: CanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [color, setColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'other'>('other');

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [paths, setPaths] = useState<Array<{ points: Point[], color: string, width: number, id?: string }>>([]);

  // Comment state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPosition, setCommentPosition] = useState<Point | null>(null);
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [hoveredComment, setHoveredComment] = useState<any>(null);
  const [commentTooltipPos, setCommentTooltipPos] = useState<Point | null>(null);

  // Determine file type and load file
  useEffect(() => {
    const contentType = attachment.contentType.toLowerCase();

    if (contentType.startsWith('image/')) {
      setFileType('image');
      loadImage();
    } else if (contentType === 'application/pdf') {
      setFileType('pdf');
      setLoading(false);
    } else {
      setFileType('other');
      setLoading(false);
    }
  }, [attachment.blobUrl, attachment.contentType]);

  const loadImage = () => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imageRef.current = img;
      setLoading(false);
      redrawCanvas();
    };

    img.onerror = () => {
      console.error('Failed to load image');
      setLoading(false);
    };

    img.src = attachment.blobUrl;
  };

  // Redraw canvas whenever paths or markups change
  useEffect(() => {
    redrawCanvas();
  }, [paths, markups, showMarkups]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // For images, draw the background image
    if (fileType === 'image' && imageRef.current) {
      const img = imageRef.current;
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height,
        1
      );
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    // For PDFs, the iframe is behind the canvas, so we just draw markups on transparent canvas

    // Draw saved markups from database
    if (showMarkups) {
      markups.forEach(markup => {
        if (markup.type === 'DRAWING' && markup.canvasData?.points) {
          drawPath(ctx, markup.canvasData.points, markup.color || '#FF0000', markup.strokeWidth || 3);
        } else if (markup.type === 'COMMENT' && markup.position) {
          drawCommentPin(ctx, markup.position, markup.color || '#FF0000');
        }
      });
    }

    // Draw current paths
    paths.forEach(path => {
      drawPath(ctx, path.points, path.color, path.width);
    });

    // Draw current drawing path
    if (currentPath.length > 0) {
      drawPath(ctx, currentPath, color, strokeWidth);
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D, points: Point[], pathColor: string, pathWidth: number) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = pathColor;
    ctx.lineWidth = pathWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  const drawCommentPin = (ctx: CanvasRenderingContext2D, position: any, pinColor: string) => {
    const x = position.x;
    const y = position.y;

    // Draw pin circle
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.fillStyle = pinColor;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw message icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💬', x, y);
  };

  const getMousePos = (e: MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (activeTool === 'comment') {
      // Place comment pin
      setCommentPosition(pos);
      setShowCommentModal(true);
      return;
    }

    if (activeTool !== 'draw') return;

    setIsDrawing(true);
    setCurrentPath([pos]);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    // Check if hovering over a comment pin
    if (activeTool === 'select' && showMarkups) {
      let foundComment = null;
      for (const markup of markups) {
        if (markup.type === 'COMMENT' && markup.position) {
          const distance = Math.sqrt(
            Math.pow(pos.x - markup.position.x, 2) +
            Math.pow(pos.y - markup.position.y, 2)
          );
          if (distance <= 12) {
            foundComment = markup;
            break;
          }
        }
      }

      if (foundComment) {
        setHoveredComment(foundComment);
        setCommentTooltipPos(pos);
      } else {
        setHoveredComment(null);
        setCommentTooltipPos(null);
      }
    }

    if (!isDrawing || activeTool !== 'draw') return;

    setCurrentPath(prev => [...prev, pos]);
    redrawCanvas();
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 1) {
      // Save to database
      const pathData = {
        points: currentPath,
        color,
        width: strokeWidth
      };

      try {
        const response = await fetcher({
          url: API_PROJECT_CHECKPOINT_MARKUPS_CREATE_ROUTE,
          requestBody: {
            attachmentId: attachment.id,
            type: 'DRAWING',
            canvasData: pathData,
            color,
            strokeWidth
          }
        });

        if (response.err) {
          toast.error('Failed to save markup');
        } else if (response.content) {
          onMarkupCreated(response.content);
          setPaths(prev => [...prev, { ...pathData, id: response.content.id }]);
        }
      } catch (error) {
        console.error('Error saving markup:', error);
        toast.error('An error occurred while saving your markup');
      }
    }

    setCurrentPath([]);
  };

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool !== 'draw') {
      setIsDrawing(false);
      setCurrentPath([]);
    }
  };

  const handleSaveComment = async () => {
    if (!commentText.trim() || !commentPosition) return;

    setSavingComment(true);
    try {
      const response = await fetcher({
        url: API_PROJECT_CHECKPOINT_MARKUPS_CREATE_ROUTE,
        requestBody: {
          attachmentId: attachment.id,
          type: 'COMMENT',
          canvasData: {},
          position: commentPosition,
          color: color
        }
      });

      if (response.err) {
        toast.error('Failed to save comment');
        setSavingComment(false);
        return;
      }

      if (response.content) {
        // Now save the comment text as a markup comment
        const commentResponse = await fetcher({
          url: API_PROJECT_CHECKPOINT_MARKUPS_COMMENTS_CREATE_ROUTE,
          requestBody: {
            markupId: response.content.id,
            text: commentText
          }
        });

        if (commentResponse.err) {
          toast.error('Failed to save comment text');
        } else {
          // Refresh markups to get the updated comment with text
          onMarkupsUpdated();
          setShowCommentModal(false);
          setCommentText('');
          setCommentPosition(null);
          toast.success('Comment added');
        }
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      toast.error('An error occurred while saving your comment');
    } finally {
      setSavingComment(false);
    }
  };

  const handleUndo = async () => {
    if (markups.length === 0) return;

    const lastMarkup = markups[markups.length - 1];

    try {
      const response = await fetcher({
        url: API_PROJECT_CHECKPOINT_MARKUPS_DELETE_ROUTE,
        requestBody: {
          markupId: lastMarkup.id
        }
      });

      if (response.err) {
        toast.error('Failed to delete markup');
      } else {
        onMarkupDeleted(lastMarkup.id);
        toast.success('Markup deleted');
      }
    } catch (error) {
      console.error('Error deleting markup:', error);
      toast.error('An error occurred while deleting the markup');
    }
  };

  const handleClearAll = async () => {
    if (markups.length === 0) return;

    if (!confirm('Are you sure you want to delete all markups?')) return;

    try {
      for (const markup of markups) {
        await fetcher({
          url: API_PROJECT_CHECKPOINT_MARKUPS_DELETE_ROUTE,
          requestBody: {
            markupId: markup.id
          }
        });
      }

      onMarkupsUpdated();
      setPaths([]);
      toast.success('All markups cleared');
    } catch (error) {
      console.error('Error clearing markups:', error);
      toast.error('An error occurred while clearing markups');
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <CanvasToolbar
        activeTool={activeTool}
        color={color}
        strokeWidth={strokeWidth}
        onToolChange={handleToolChange}
        onColorChange={setColor}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onClearAll={handleClearAll}
      />

      <div className="flex-1 relative flex items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {fileType === 'other' ? (
          <div className="border border-border rounded-lg shadow-lg bg-card p-8 text-center max-w-md">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Markup Not Available
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Markup tools are currently only available for images and PDFs. For other file types, please download the file to view it.
            </p>
            <a
              href={attachment.blobUrl}
              download={attachment.pathname}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Download File
            </a>
          </div>
        ) : (
          <div className="relative border border-border rounded-lg shadow-lg overflow-hidden" style={{ width: 800, height: 600 }}>
            {fileType === 'pdf' && (
              <iframe
                ref={iframeRef}
                src={`${attachment.blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: activeTool === 'draw' ? 'none' : 'auto' }}
              />
            )}
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className={`absolute inset-0 ${fileType === 'pdf' ? 'bg-transparent' : 'bg-muted'} ${activeTool === 'draw' || activeTool === 'comment' ? 'cursor-crosshair' : 'cursor-default'}`}
              style={{ pointerEvents: activeTool === 'select' || activeTool === 'draw' || activeTool === 'comment' ? 'auto' : 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            {/* Comment Tooltip */}
            {hoveredComment && commentTooltipPos && hoveredComment.comments && hoveredComment.comments.length > 0 && (
              <div
                className="absolute bg-card border border-border rounded-lg shadow-xl p-3 max-w-xs z-50 pointer-events-none"
                style={{
                  left: commentTooltipPos.x + 20,
                  top: commentTooltipPos.y - 20
                }}
              >
                <div className="text-xs font-semibold text-foreground mb-1">
                  {hoveredComment.userId ? 'You' : hoveredComment.visitorName || 'Anonymous'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {hoveredComment.comments[0].text}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCommentModal(false)}>
          <div className="bg-card border border-border rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Add Comment</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full h-32 px-3 py-2 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setCommentText('');
                  setCommentPosition(null);
                }}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                disabled={savingComment}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComment}
                disabled={!commentText.trim() || savingComment}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingComment ? 'Saving...' : 'Save Comment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
