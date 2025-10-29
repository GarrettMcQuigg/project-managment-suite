'use client';

import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import CanvasToolbar from './canvas-toolbar';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import {
  API_PROJECT_CHECKPOINT_MARKUPS_CREATE_ROUTE,
  API_PROJECT_CHECKPOINT_MARKUPS_BATCH_CREATE_ROUTE,
  API_PROJECT_CHECKPOINT_MARKUPS_BATCH_DELETE_ROUTE,
  API_PROJECT_CHECKPOINT_MARKUPS_COMMENTS_CREATE_ROUTE
} from '@/packages/lib/routes';
import { toast } from 'react-toastify';
import type { ProjectMessageAttachment } from '@prisma/client';

type ToolType = 'select' | 'comment' | 'draw' | 'highlight' | 'rectangle' | 'circle' | 'arrow' | 'eraser';

interface CanvasViewerProps {
  attachment: ProjectMessageAttachment;
  markups: any[];
  showMarkups: boolean;
  isOwner: boolean;
  currentUserName: string;
  focusedCommentId?: string | null;
  onMarkupCreated: (markup: any) => void;
  onMarkupDeleted: (markupId: string) => void;
  onMarkupsUpdated: () => void;
  onCommentFocus?: (markupId: string | null) => void;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void;
}

interface Point {
  x: number;
  y: number;
}

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

export default function CanvasViewer({ attachment, markups, showMarkups, isOwner, currentUserName, focusedCommentId, onMarkupCreated, onMarkupDeleted, onMarkupsUpdated, onCommentFocus, onSaveStatusChange }: CanvasViewerProps) {
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
  const [paths, setPaths] = useState<Array<{ points: Point[]; color: string; width: number; isHighlight?: boolean; id?: string }>>([]);
  const [unsavedPaths, setUnsavedPaths] = useState<Array<{ points: Point[]; color: string; width: number; isHighlight?: boolean }>>([]);

  // Shape state (for highlight, rectangle, circle, arrow)
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [shapeEnd, setShapeEnd] = useState<Point | null>(null);
  const [shapes, setShapes] = useState<Array<{ type: ToolType; start: Point; end: Point; color: string; width: number; id?: string }>>([]);
  const [unsavedShapes, setUnsavedShapes] = useState<Array<{ type: ToolType; start: Point; end: Point; color: string; width: number }>>([]);

  // Undo/Redo state - unified history for all markup types
  type HistoryItem =
    | { type: 'path'; data: { points: Point[]; color: string; width: number; isHighlight?: boolean }; id?: string }
    | { type: 'shape'; data: { type: ToolType; start: Point; end: Point; color: string; width: number }; id?: string };

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to track current unsaved state (for closure issues with setTimeout)
  const unsavedPathsRef = useRef<typeof unsavedPaths>([]);
  const unsavedShapesRef = useRef<typeof unsavedShapes>([]);
  const pendingDeletesRef = useRef<string[]>([]);

  // Notify parent of save status changes
  const updateSaveStatus = (status: 'saved' | 'saving' | 'unsaved') => {
    onSaveStatusChange?.(status);
  };

  // Comment state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPosition, setCommentPosition] = useState<Point | null>(null);
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [hoveredComment, setHoveredComment] = useState<any>(null);
  const [commentTooltipPos, setCommentTooltipPos] = useState<Point | null>(null);
  const [isHoveringCommentPin, setIsHoveringCommentPin] = useState(false);

  // Eraser state
  const [eraserPath, setEraserPath] = useState<Point[]>([]);
  const [markupsToDelete, setMarkupsToDelete] = useState<Set<string>>(new Set());
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);

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

  // Redraw canvas whenever paths, shapes, or markups change
  useEffect(() => {
    redrawCanvas();
  }, [paths, shapes, markups, showMarkups, shapeStart, shapeEnd, pendingDeletes]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // For images, draw the background image
    if (fileType === 'image' && imageRef.current) {
      const img = imageRef.current;
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height, 1);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    // For PDFs, the iframe is behind the canvas, so we just draw markups on transparent canvas

    // Draw saved markups from database (excluding pending deletes)
    if (showMarkups) {
      markups.forEach((markup) => {
        // Skip markups that are pending deletion
        if (pendingDeletes.includes(markup.id)) return;

        if (markup.type === 'DRAWING' && markup.canvasData?.points) {
          drawPath(ctx, markup.canvasData.points, markup.color || '#FF0000', markup.strokeWidth || 3, false);
        } else if (markup.type === 'HIGHLIGHT' && markup.canvasData?.points) {
          drawPath(ctx, markup.canvasData.points, markup.color || '#FFFF00', markup.strokeWidth || 3, true);
        } else if (markup.type === 'COMMENT' && markup.position) {
          const commentColor = getCommentColor(markup.id);
          const isFocused = focusedCommentId === markup.id;
          drawCommentPin(ctx, markup.position, commentColor, isFocused);
        } else if (markup.type === 'SHAPE' && markup.canvasData?.start && markup.canvasData?.end) {
          drawShape(ctx, markup.canvasData.shapeType || markup.type, markup.canvasData.start, markup.canvasData.end, markup.color || '#FF0000', markup.strokeWidth || 3);
        }
      });
    }

    // Draw current paths
    paths.forEach((path) => {
      drawPath(ctx, path.points, path.color, path.width, path.isHighlight || false);
    });

    // Draw saved shapes
    shapes.forEach((shape) => {
      drawShape(ctx, shape.type, shape.start, shape.end, shape.color, shape.width);
    });

    // Draw current drawing path
    if (currentPath.length > 0) {
      drawPath(ctx, currentPath, color, strokeWidth, activeTool === 'highlight');
    }

    // Draw current shape being drawn
    if (shapeStart && shapeEnd && ['rectangle', 'circle', 'arrow'].includes(activeTool)) {
      drawShape(ctx, activeTool, shapeStart, shapeEnd, color, strokeWidth);
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D, points: Point[], pathColor: string, pathWidth: number, isHighlight: boolean = false) => {
    if (points.length < 2) return;

    ctx.beginPath();

    if (isHighlight) {
      // Highlighter style - thicker and semi-transparent
      ctx.strokeStyle = pathColor + '50'; // 50% opacity
      ctx.lineWidth = Math.max(pathWidth * 4, 20); // Much thicker
    } else {
      // Regular drawing
      ctx.strokeStyle = pathColor;
      ctx.lineWidth = pathWidth;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  const drawCommentPin = (ctx: CanvasRenderingContext2D, position: any, pinColor: string, isFocused: boolean = false) => {
    const x = position.x;
    const y = position.y;

    // Draw focus ring if this comment is focused
    if (isFocused) {
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, 2 * Math.PI);
      ctx.strokeStyle = pinColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Draw pin circle
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.fillStyle = pinColor;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add shadow for clickable appearance
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Draw message icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💬', x, y);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shapeType: string, start: Point, end: Point, shapeColor: string, shapeWidth: number) => {
    ctx.strokeStyle = shapeColor;
    ctx.lineWidth = shapeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (shapeType.toLowerCase()) {
      case 'rectangle':
        ctx.beginPath();
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;

      case 'circle':
        const radiusX = Math.abs(end.x - start.x) / 2;
        const radiusY = Math.abs(end.y - start.y) / 2;
        const centerX = start.x + (end.x - start.x) / 2;
        const centerY = start.y + (end.y - start.y) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'arrow':
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const arrowLength = 15;
        const arrowWidth = Math.PI / 6;

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - arrowLength * Math.cos(angle - arrowWidth), end.y - arrowLength * Math.sin(angle - arrowWidth));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - arrowLength * Math.cos(angle + arrowWidth), end.y - arrowLength * Math.sin(angle + arrowWidth));
        ctx.stroke();
        break;
    }
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

  // Helper function to check if a point is near a path
  const isPointNearPath = (point: Point, pathPoints: Point[], threshold: number = 15): boolean => {
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1 = pathPoints[i];
      const p2 = pathPoints[i + 1];

      // Calculate distance from point to line segment
      const lineLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      if (lineLength === 0) continue;

      const t = Math.max(0, Math.min(1, ((point.x - p1.x) * (p2.x - p1.x) + (point.y - p1.y) * (p2.y - p1.y)) / (lineLength * lineLength)));
      const projX = p1.x + t * (p2.x - p1.x);
      const projY = p1.y + t * (p2.y - p1.y);
      const distance = Math.sqrt(Math.pow(point.x - projX, 2) + Math.pow(point.y - projY, 2));

      if (distance <= threshold) {
        return true;
      }
    }
    return false;
  };

  // Helper function to check if a point is near a shape
  const isPointNearShape = (point: Point, start: Point, end: Point, shapeType: string, threshold: number = 15): boolean => {
    switch (shapeType.toLowerCase()) {
      case 'rectangle':
        // Check if point is near any edge of rectangle
        const left = Math.min(start.x, end.x);
        const right = Math.max(start.x, end.x);
        const top = Math.min(start.y, end.y);
        const bottom = Math.max(start.y, end.y);

        return (
          (point.x >= left - threshold && point.x <= right + threshold && (Math.abs(point.y - top) <= threshold || Math.abs(point.y - bottom) <= threshold)) ||
          (point.y >= top - threshold && point.y <= bottom + threshold && (Math.abs(point.x - left) <= threshold || Math.abs(point.x - right) <= threshold))
        );

      case 'circle':
        // Check if point is near the ellipse perimeter
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        const radiusX = Math.abs(end.x - start.x) / 2;
        const radiusY = Math.abs(end.y - start.y) / 2;

        const normalizedX = (point.x - centerX) / radiusX;
        const normalizedY = (point.y - centerY) / radiusY;
        const distanceFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

        return Math.abs(distanceFromCenter - 1) <= threshold / Math.max(radiusX, radiusY);

      case 'arrow':
        // Check if point is near the arrow line
        return isPointNearPath(point, [start, end], threshold);

      default:
        return false;
    }
  };

  const handleMouseDown = async (e: MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    // Check if clicking on a comment pin with select tool
    if (activeTool === 'select' && showMarkups) {
      for (const markup of markups) {
        if (markup.type === 'COMMENT' && markup.position && !pendingDeletes.includes(markup.id)) {
          const distance = Math.sqrt(Math.pow(pos.x - markup.position.x, 2) + Math.pow(pos.y - markup.position.y, 2));
          if (distance <= 12) {
            // Comment pin clicked - toggle focus
            onCommentFocus?.(focusedCommentId === markup.id ? null : markup.id);
            return;
          }
        }
      }
      // Clicked elsewhere - clear focus
      onCommentFocus?.(null);
      return;
    }

    if (activeTool === 'comment') {
      // Place comment pin
      setCommentPosition(pos);
      setShowCommentModal(true);
      return;
    }

    if (activeTool === 'eraser') {
      setIsDrawing(true);
      setEraserPath([pos]);
      setMarkupsToDelete(new Set());
      return;
    }

    if (activeTool === 'draw' || activeTool === 'highlight') {
      setIsDrawing(true);
      setCurrentPath([pos]);
      return;
    }

    if (['rectangle', 'circle', 'arrow'].includes(activeTool)) {
      setIsDrawing(true);
      setShapeStart(pos);
      setShapeEnd(pos);
      return;
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    // Check if hovering over a comment pin
    if (activeTool === 'select' && showMarkups) {
      let foundComment = null;
      for (const markup of markups) {
        // Skip markups that are pending deletion
        if (pendingDeletes.includes(markup.id)) continue;

        if (markup.type === 'COMMENT' && markup.position) {
          const distance = Math.sqrt(Math.pow(pos.x - markup.position.x, 2) + Math.pow(pos.y - markup.position.y, 2));
          if (distance <= 12) {
            foundComment = markup;
            break;
          }
        }
      }

      if (foundComment) {
        setHoveredComment(foundComment);
        setIsHoveringCommentPin(true);
        // Convert canvas coordinates to viewport coordinates
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          setCommentTooltipPos({
            x: rect.left + pos.x,
            y: rect.top + pos.y
          });
        }
      } else {
        setHoveredComment(null);
        setCommentTooltipPos(null);
        setIsHoveringCommentPin(false);
      }
    }

    if (!isDrawing) return;

    if (activeTool === 'draw' || activeTool === 'highlight') {
      setCurrentPath((prev) => [...prev, pos]);
      redrawCanvas();
    } else if (['rectangle', 'circle', 'arrow'].includes(activeTool)) {
      setShapeEnd(pos);
    } else if (activeTool === 'eraser') {
      setEraserPath((prev) => [...prev, pos]);

      // Check which markups the eraser is touching
      const newMarkupsToDelete = new Set(markupsToDelete);

      // Check saved markups from database - only allow deletion of user-owned markups
      markups.forEach((markup) => {
        // Check ownership: for authenticated users check userId, for portal visitors check name
        const isOwnedByUser = isOwner ? markup.userId !== null : markup.name === currentUserName;
        if (!isOwnedByUser) return; // Skip markups not owned by current user

        if (markup.type === 'DRAWING' && markup.canvasData?.points) {
          if (isPointNearPath(pos, markup.canvasData.points)) {
            newMarkupsToDelete.add(markup.id);
          }
        } else if (markup.type === 'HIGHLIGHT' && markup.canvasData?.points) {
          if (isPointNearPath(pos, markup.canvasData.points, 25)) {
            newMarkupsToDelete.add(markup.id);
          }
        } else if (markup.type === 'COMMENT' && markup.position) {
          const distance = Math.sqrt(Math.pow(pos.x - markup.position.x, 2) + Math.pow(pos.y - markup.position.y, 2));
          if (distance <= 12) {
            newMarkupsToDelete.add(markup.id);
          }
        } else if (markup.type === 'SHAPE' && markup.canvasData?.start && markup.canvasData?.end) {
          if (isPointNearShape(pos, markup.canvasData.start, markup.canvasData.end, markup.canvasData.shapeType)) {
            newMarkupsToDelete.add(markup.id);
          }
        }
      });

      // Check local paths
      paths.forEach((path, index) => {
        if (isPointNearPath(pos, path.points, path.isHighlight ? 25 : 15)) {
          // Mark local path for deletion by storing its index
          newMarkupsToDelete.add(`local-path-${index}`);
        }
      });

      // Check local shapes
      shapes.forEach((shape, index) => {
        if (isPointNearShape(pos, shape.start, shape.end, shape.type)) {
          newMarkupsToDelete.add(`local-shape-${index}`);
        }
      });

      setMarkupsToDelete(newMarkupsToDelete);
    }
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Handle eraser - batch deletions locally and schedule API call
    if (activeTool === 'eraser' && markupsToDelete.size > 0) {
      // Separate database markups from local markups
      const dbMarkupIds: string[] = [];
      const localPathIndices: number[] = [];
      const localShapeIndices: number[] = [];

      markupsToDelete.forEach((id) => {
        if (typeof id === 'string') {
          if (id.startsWith('local-path-')) {
            localPathIndices.push(parseInt(id.replace('local-path-', '')));
          } else if (id.startsWith('local-shape-')) {
            localShapeIndices.push(parseInt(id.replace('local-shape-', '')));
          } else {
            dbMarkupIds.push(id);
          }
        }
      });

      // Delete from local state immediately for instant feedback
      if (localPathIndices.length > 0) {
        setPaths((prev) => prev.filter((_, index) => !localPathIndices.includes(index)));
        setUnsavedPaths((prev) => {
          const updated = prev.filter((_, index) => !localPathIndices.includes(index));
          unsavedPathsRef.current = updated;
          return updated;
        });
      }

      if (localShapeIndices.length > 0) {
        setShapes((prev) => prev.filter((_, index) => !localShapeIndices.includes(index)));
        setUnsavedShapes((prev) => {
          const updated = prev.filter((_, index) => !localShapeIndices.includes(index));
          unsavedShapesRef.current = updated;
          return updated;
        });
      }

      // Add database markups to pending deletes and hide them locally
      if (dbMarkupIds.length > 0) {
        setPendingDeletes((prev) => {
          const updated = [...prev, ...dbMarkupIds];
          pendingDeletesRef.current = updated;
          return updated;
        });
        // Hide deleted markups from view by removing from local markup list
        dbMarkupIds.forEach((id) => onMarkupDeleted(id));
        updateSaveStatus('unsaved');
        scheduleDebouncedSave();
      }

      setEraserPath([]);
      setMarkupsToDelete(new Set());
      return;
    }

    // Handle freehand drawing and highlight
    if ((activeTool === 'draw' || activeTool === 'highlight') && currentPath.length > 1) {
      const pathData = {
        points: currentPath,
        color,
        width: strokeWidth,
        isHighlight: activeTool === 'highlight'
      };

      // Save to local state immediately for instant feedback
      setPaths((prev) => [...prev, pathData]);
      setUnsavedPaths((prev) => {
        const updated = [...prev, pathData];
        unsavedPathsRef.current = updated;
        return updated;
      });
      setHistory((prev) => [...prev, { type: 'path', data: pathData }]);
      setRedoStack([]); // Clear redo stack when new action is made
      updateSaveStatus('unsaved');

      // Add temporary markup to activity log
      const tempMarkup = {
        id: `temp-${Date.now()}`,
        type: activeTool === 'highlight' ? 'HIGHLIGHT' : 'DRAWING',
        color,
        strokeWidth,
        createdAt: new Date().toISOString(),
        userId: isOwner ? 'current-user' : null,
        name: 'You',
        canvasData: pathData,
        comments: []
      };
      onMarkupCreated(tempMarkup);

      // Debounce the API save
      scheduleDebouncedSave();
      setCurrentPath([]);
    }

    // Handle shape drawing
    if (['rectangle', 'circle', 'arrow'].includes(activeTool) && shapeStart && shapeEnd) {
      const shapeData = {
        type: activeTool,
        start: shapeStart,
        end: shapeEnd,
        color,
        width: strokeWidth
      };

      // Save to local state immediately
      setShapes((prev) => [...prev, shapeData]);
      setUnsavedShapes((prev) => {
        const updated = [...prev, shapeData];
        unsavedShapesRef.current = updated;
        return updated;
      });
      setHistory((prev) => [...prev, { type: 'shape', data: shapeData }]);
      setRedoStack([]); // Clear redo stack when new action is made
      updateSaveStatus('unsaved');

      // Add temporary markup to activity log
      const tempMarkup = {
        id: `temp-${Date.now()}`,
        type: activeTool === 'highlight' ? 'HIGHLIGHT' : 'SHAPE',
        color,
        strokeWidth,
        createdAt: new Date().toISOString(),
        userId: isOwner ? 'current-user' : null,
        name: 'You',
        canvasData: { shapeType: activeTool, start: shapeStart, end: shapeEnd },
        comments: []
      };
      onMarkupCreated(tempMarkup);

      // Debounce the API save
      scheduleDebouncedSave();
      setShapeStart(null);
      setShapeEnd(null);
    }
  };

  // Debounced save function
  const scheduleDebouncedSave = () => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule new save after 2.5 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveAllPendingDrawings();
    }, 2500);
  };

  // Save all unsaved drawings and deletions to database
  const saveAllPendingDrawings = async () => {
    // Use refs to get current state values (avoids stale closure)
    const currentUnsavedPaths = unsavedPathsRef.current;
    const currentUnsavedShapes = unsavedShapesRef.current;
    const currentPendingDeletes = pendingDeletesRef.current;

    if (currentUnsavedPaths.length === 0 && currentUnsavedShapes.length === 0 && currentPendingDeletes.length === 0) return;

    setIsSaving(true);
    updateSaveStatus('saving');

    try {
      const promises = [];

      // Batch delete all pending markups in a single API call
      if (currentPendingDeletes.length > 0) {
        promises.push(
          fetcher({
            url: API_PROJECT_CHECKPOINT_MARKUPS_BATCH_DELETE_ROUTE,
            requestBody: {
              markupIds: currentPendingDeletes
            }
          })
        );
      }

      // Batch create all unsaved markups in a single API call
      if (currentUnsavedPaths.length > 0 || currentUnsavedShapes.length > 0) {
        // Combine paths and shapes into one markups array
        const markupsToCreate = [
          ...currentUnsavedPaths.map((pathData) => ({
            attachmentId: attachment.id,
            type: pathData.isHighlight ? 'HIGHLIGHT' : 'DRAWING',
            canvasData: pathData,
            color: pathData.color,
            strokeWidth: pathData.width
          })),
          ...currentUnsavedShapes.map((shapeData) => ({
            attachmentId: attachment.id,
            type: shapeData.type === 'highlight' ? 'HIGHLIGHT' : 'SHAPE',
            canvasData: {
              shapeType: shapeData.type,
              start: shapeData.start,
              end: shapeData.end
            },
            color: shapeData.color,
            strokeWidth: shapeData.width
          }))
        ];

        promises.push(
          fetcher({
            url: API_PROJECT_CHECKPOINT_MARKUPS_BATCH_CREATE_ROUTE,
            requestBody: {
              markups: markupsToCreate
            }
          })
        );
      }

      // Execute delete and create in parallel (2 API calls max instead of N+M calls)
      const results = await Promise.all(promises);

      // Check for errors
      for (const result of results) {
        if (result.err) {
          throw new Error('Failed to save/delete markups');
        }
      }

      // Get created markups from the batch create response
      const createResponse = results.find((r) => r.content && Array.isArray(r.content));
      const allSavedMarkups = createResponse?.content || [];

      // Update paths with IDs from server
      setPaths((prev) => {
        const newPaths = [...prev];
        allSavedMarkups.slice(0, currentUnsavedPaths.length).forEach((markup: any, index: number) => {
          const pathIndex = newPaths.length - currentUnsavedPaths.length + index;
          if (newPaths[pathIndex]) {
            newPaths[pathIndex] = { ...newPaths[pathIndex], id: markup.id };
          }
        });
        return newPaths;
      });

      // Update shapes with IDs from server
      setShapes((prev) => {
        const newShapes = [...prev];
        allSavedMarkups.slice(currentUnsavedPaths.length).forEach((markup: any, index: number) => {
          const shapeIndex = newShapes.length - currentUnsavedShapes.length + index;
          if (newShapes[shapeIndex]) {
            newShapes[shapeIndex] = { ...newShapes[shapeIndex], id: markup.id };
          }
        });
        return newShapes;
      });

      // Update history items with IDs from server
      setHistory((prev) => {
        const newHistory = [...prev];
        let pathCount = 0;
        let shapeCount = 0;

        // Go through history in reverse to find unsaved items and update with IDs
        for (let i = newHistory.length - 1; i >= 0; i--) {
          const item = newHistory[i];
          if (!item.id) {
            if (item.type === 'path' && pathCount < currentUnsavedPaths.length) {
              const markupIndex = currentUnsavedPaths.length - 1 - pathCount;
              newHistory[i] = { ...item, id: allSavedMarkups[markupIndex]?.id };
              pathCount++;
            } else if (item.type === 'shape' && shapeCount < currentUnsavedShapes.length) {
              const markupIndex = currentUnsavedPaths.length + (currentUnsavedShapes.length - 1 - shapeCount);
              newHistory[i] = { ...item, id: allSavedMarkups[markupIndex]?.id };
              shapeCount++;
            }
          }
        }
        return newHistory;
      });

      // Clear unsaved items and pending deletes
      setUnsavedPaths([]);
      setUnsavedShapes([]);
      setPendingDeletes([]);
      unsavedPathsRef.current = [];
      unsavedShapesRef.current = [];
      pendingDeletesRef.current = [];
      updateSaveStatus('saved');

      // Notify parent to refresh
      onMarkupsUpdated();
    } catch (error) {
      console.error('Error saving markups:', error);
      toast.error('Failed to save some drawings');
      updateSaveStatus('unsaved');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToolChange = (tool: ToolType) => {
    // Auto-save when switching tools
    if (unsavedPaths.length > 0 || unsavedShapes.length > 0 || pendingDeletes.length > 0) {
      saveAllPendingDrawings();
    }

    setActiveTool(tool);
    setIsDrawing(false);
    setCurrentPath([]);
    setShapeStart(null);
    setShapeEnd(null);
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

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastItem = history[history.length - 1];

    // Remove from history and add to redo stack
    setHistory((prev) => prev.slice(0, -1));

    // When adding to redo stack, clear the ID since if we redo it will get a new ID
    // This prevents trying to delete non-existent IDs
    const itemForRedo = { ...lastItem, id: undefined };
    setRedoStack((prev) => [...prev, itemForRedo]);

    if (lastItem.type === 'path') {
      // Remove from paths immediately for visual feedback
      setPaths((prev) => prev.slice(0, -1));

      // If it was unsaved, remove from unsaved paths
      setUnsavedPaths((prev) => {
        const index = prev.findIndex((p) => p === lastItem.data);
        if (index !== -1) {
          const updated = prev.filter((_, i) => i !== index);
          unsavedPathsRef.current = updated;
          return updated;
        }
        return prev;
      });

      // If it has an ID, add to pending deletes for batch API call (avoid duplicates)
      if (lastItem.id) {
        setPendingDeletes((prev) => {
          if (!prev.includes(lastItem.id!)) {
            const updated = [...prev, lastItem.id!];
            pendingDeletesRef.current = updated;
            return updated;
          }
          return prev;
        });
        // Hide from UI immediately
        onMarkupDeleted(lastItem.id);
        updateSaveStatus('unsaved');
        scheduleDebouncedSave();
      }
    } else if (lastItem.type === 'shape') {
      // Remove from shapes immediately for visual feedback
      setShapes((prev) => prev.slice(0, -1));

      // If it was unsaved, remove from unsaved shapes
      setUnsavedShapes((prev) => {
        const index = prev.findIndex((s) => s === lastItem.data);
        if (index !== -1) {
          const updated = prev.filter((_, i) => i !== index);
          unsavedShapesRef.current = updated;
          return updated;
        }
        return prev;
      });

      // If it has an ID, add to pending deletes for batch API call (avoid duplicates)
      if (lastItem.id) {
        setPendingDeletes((prev) => {
          if (!prev.includes(lastItem.id!)) {
            const updated = [...prev, lastItem.id!];
            pendingDeletesRef.current = updated;
            return updated;
          }
          return prev;
        });
        // Hide from UI immediately
        onMarkupDeleted(lastItem.id);
        updateSaveStatus('unsaved');
        scheduleDebouncedSave();
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const itemToRedo = redoStack[redoStack.length - 1];

    // Remove from redo stack and add back to history
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, itemToRedo]);

    if (itemToRedo.type === 'path') {
      // Add back to paths immediately for visual feedback
      setPaths((prev) => [...prev, itemToRedo.data]);

      // Add temporary markup back to activity log
      const tempMarkup = {
        id: `temp-${Date.now()}`,
        type: itemToRedo.data.isHighlight ? 'HIGHLIGHT' : 'DRAWING',
        color: itemToRedo.data.color,
        strokeWidth: itemToRedo.data.width,
        createdAt: new Date().toISOString(),
        userId: isOwner ? 'current-user' : null,
        name: 'You',
        canvasData: itemToRedo.data,
        comments: []
      };
      onMarkupCreated(tempMarkup);

      // Mark as unsaved
      setUnsavedPaths((prev) => {
        const updated = [...prev, itemToRedo.data];
        unsavedPathsRef.current = updated;
        return updated;
      });

      // If this was previously deleted, remove from pending deletes
      if (itemToRedo.id) {
        setPendingDeletes((prev) => {
          const updated = prev.filter((id) => id !== itemToRedo.id);
          pendingDeletesRef.current = updated;
          return updated;
        });
      }
    } else if (itemToRedo.type === 'shape') {
      // Add back to shapes immediately for visual feedback
      setShapes((prev) => [...prev, itemToRedo.data]);

      // Add temporary markup back to activity log
      const tempMarkup = {
        id: `temp-${Date.now()}`,
        type: 'SHAPE',
        color: itemToRedo.data.color,
        strokeWidth: itemToRedo.data.width,
        createdAt: new Date().toISOString(),
        userId: isOwner ? 'current-user' : null,
        name: 'You',
        canvasData: {
          shapeType: itemToRedo.data.type,
          start: itemToRedo.data.start,
          end: itemToRedo.data.end
        },
        comments: []
      };
      onMarkupCreated(tempMarkup);

      // Mark as unsaved
      setUnsavedShapes((prev) => {
        const updated = [...prev, itemToRedo.data];
        unsavedShapesRef.current = updated;
        return updated;
      });

      // If this was previously deleted, remove from pending deletes
      if (itemToRedo.id) {
        setPendingDeletes((prev) => {
          const updated = prev.filter((id) => id !== itemToRedo.id);
          pendingDeletesRef.current = updated;
          return updated;
        });
      }
    }

    updateSaveStatus('unsaved');
    scheduleDebouncedSave();
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, redoStack]);

  const handleClearAll = async () => {
    const totalMarkups = markups.length + paths.length + shapes.length;
    if (totalMarkups === 0) return;

    if (!confirm('Are you sure you want to delete all markups?')) return;

    try {
      // Filter markups to only include user-owned markups
      // For authenticated users: check userId, for portal visitors: check name
      const userOwnedMarkups = markups.filter((m) => {
        if (isOwner) {
          // Owner can be identified by userId
          return m.userId !== null;
        } else {
          // Portal visitor is identified by name
          return m.name === currentUserName;
        }
      });

      // Collect markup IDs (only user-owned from database, all local since they're newly created)
      const markupIds = userOwnedMarkups.map((m) => m.id);
      const localPathIds = paths.filter((p) => p.id).map((p) => p.id!);
      const localShapeIds = shapes.filter((s) => s.id).map((s) => s.id!);
      const allIds = [...markupIds, ...localPathIds, ...localShapeIds];

      // Use batch delete API if there are any saved markups
      if (allIds.length > 0) {
        const result = await fetcher({
          url: API_PROJECT_CHECKPOINT_MARKUPS_BATCH_DELETE_ROUTE,
          requestBody: {
            markupIds: allIds
          }
        });

        if (result.err) {
          throw new Error('Failed to delete markups');
        }
      }

      // Clear all local state
      setPaths([]);
      setShapes([]);
      setUnsavedPaths([]);
      setUnsavedShapes([]);
      setPendingDeletes([]);
      unsavedPathsRef.current = [];
      unsavedShapesRef.current = [];
      pendingDeletesRef.current = [];
      setHistory([]);
      setRedoStack([]);

      onMarkupsUpdated();
      toast.success('All markups cleared');
    } catch (error) {
      console.error('Error clearing markups:', error);
      toast.error('An error occurred while clearing markups');
    }
  };

  // Handle browser close/tab switch - save unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedPaths.length > 0 || unsavedShapes.length > 0 || pendingDeletes.length > 0) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveAllPendingDrawings();
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && (unsavedPaths.length > 0 || unsavedShapes.length > 0 || pendingDeletes.length > 0)) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveAllPendingDrawings();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [unsavedPaths, unsavedShapes, pendingDeletes]);

  // Handle component unmount (modal close) - save unsaved changes
  useEffect(() => {
    return () => {
      // On unmount, save any pending changes
      if (unsavedPaths.length > 0 || unsavedShapes.length > 0 || pendingDeletes.length > 0) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveAllPendingDrawings();
      }
    };
  }, []);

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
        onRedo={handleRedo}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Markup Not Available</h3>
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
          <>
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
                className={`absolute inset-0 ${fileType === 'pdf' ? 'bg-transparent' : 'bg-muted'} ${
                  ['draw', 'comment', 'highlight', 'rectangle', 'circle', 'arrow'].includes(activeTool)
                    ? 'cursor-crosshair'
                    : activeTool === 'eraser'
                      ? 'cursor-pointer'
                      : activeTool === 'select' && isHoveringCommentPin
                        ? 'cursor-pointer'
                        : 'cursor-default'
                }`}
                style={{ pointerEvents: ['select', 'draw', 'comment', 'highlight', 'rectangle', 'circle', 'arrow', 'eraser'].includes(activeTool) ? 'auto' : 'none' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {/* Comment Tooltip/Display - show on hover or when focused */}
            {(() => {
              // Show tooltip for hovered comment (not focused)
              if (hoveredComment && !focusedCommentId && commentTooltipPos && hoveredComment.comments && hoveredComment.comments.length > 0) {
                return (
                  <div
                    className="fixed bg-card border border-border rounded-lg shadow-xl p-3 max-w-xs z-50 pointer-events-none"
                    style={{
                      left: Math.min(commentTooltipPos.x + 20, window.innerWidth - 250),
                      top: Math.max(20, commentTooltipPos.y - 20)
                    }}
                  >
                    <div className="text-xs font-semibold text-foreground mb-1">{hoveredComment.userId && isOwner ? 'You' : hoveredComment.name || 'Anonymous'}</div>
                    <div className="text-xs text-muted-foreground">{hoveredComment.comments[0].text}</div>
                  </div>
                );
              }

              // Show clickable div for focused comment
              const focusedComment = focusedCommentId ? markups.find(m => m.id === focusedCommentId && m.type === 'COMMENT') : null;
              if (focusedComment && focusedComment.comments && focusedComment.comments.length > 0 && focusedComment.position) {
                const canvas = canvasRef.current;
                if (!canvas) return null;

                const rect = canvas.getBoundingClientRect();
                const pinX = rect.left + focusedComment.position.x;
                const pinY = rect.top + focusedComment.position.y;

                // Determine if pin is on left or right side of canvas (800px width)
                const isLeftSide = focusedComment.position.x < 400;

                // Position the div next to the pin
                const divWidth = 280;
                const offset = 30; // Distance from pin

                let left, right;
                if (isLeftSide) {
                  // Pin on left, show div on left
                  right = window.innerWidth - pinX + offset;
                } else {
                  // Pin on right, show div on right
                  left = pinX + offset;
                }

                return (
                  <div
                    className="fixed bg-card border-2 rounded-lg shadow-xl p-4 z-50 select-text"
                    style={{
                      left: left !== undefined ? `${left}px` : undefined,
                      right: right !== undefined ? `${right}px` : undefined,
                      top: `${Math.max(20, pinY - 20)}px`,
                      width: `${divWidth}px`,
                      borderColor: getCommentColor(focusedComment.id)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm text-foreground">
                        {focusedComment.userId && isOwner ? 'You' : focusedComment.name || 'Anonymous'}
                      </div>
                      <button
                        onClick={() => onCommentFocus?.(null)}
                        className="text-muted-foreground hover:text-foreground transition-colors -mt-1 -mr-1 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                      {focusedComment.comments[0].text}
                    </p>
                  </div>
                );
              }

              return null;
            })()}
          </>
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
