'use client';

import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import CanvasToolbar from './canvas-toolbar';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import {
  API_PROJECT_CHECKPOINT_MARKUPS_CREATE_ROUTE,
  API_PROJECT_CHECKPOINT_MARKUPS_DELETE_ROUTE,
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
  onMarkupCreated: (markup: any) => void;
  onMarkupDeleted: (markupId: string) => void;
  onMarkupsUpdated: () => void;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void;
}

interface Point {
  x: number;
  y: number;
}

export default function CanvasViewer({ attachment, markups, showMarkups, isOwner, onMarkupCreated, onMarkupDeleted, onMarkupsUpdated, onSaveStatusChange }: CanvasViewerProps) {
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

  // Undo/Redo state
  const [history, setHistory] = useState<Array<{ points: Point[]; color: string; width: number }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ points: Point[]; color: string; width: number }>>([]);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [paths, shapes, markups, showMarkups, shapeStart, shapeEnd]);

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

    // Draw saved markups from database
    if (showMarkups) {
      markups.forEach((markup) => {
        if (markup.type === 'DRAWING' && markup.canvasData?.points) {
          drawPath(ctx, markup.canvasData.points, markup.color || '#FF0000', markup.strokeWidth || 3, false);
        } else if (markup.type === 'HIGHLIGHT' && markup.canvasData?.points) {
          drawPath(ctx, markup.canvasData.points, markup.color || '#FFFF00', markup.strokeWidth || 3, true);
        } else if (markup.type === 'COMMENT' && markup.position) {
          drawCommentPin(ctx, markup.position, markup.color || '#FF0000');
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
        ctx.lineTo(
          end.x - arrowLength * Math.cos(angle - arrowWidth),
          end.y - arrowLength * Math.sin(angle - arrowWidth)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - arrowLength * Math.cos(angle + arrowWidth),
          end.y - arrowLength * Math.sin(angle + arrowWidth)
        );
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
          (point.x >= left - threshold && point.x <= right + threshold &&
           (Math.abs(point.y - top) <= threshold || Math.abs(point.y - bottom) <= threshold)) ||
          (point.y >= top - threshold && point.y <= bottom + threshold &&
           (Math.abs(point.x - left) <= threshold || Math.abs(point.x - right) <= threshold))
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
        setCommentTooltipPos(pos);
      } else {
        setHoveredComment(null);
        setCommentTooltipPos(null);
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

      // Check saved markups from database
      markups.forEach((markup) => {
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
        setUnsavedPaths((prev) => prev.filter((_, index) => !localPathIndices.includes(index)));
      }

      if (localShapeIndices.length > 0) {
        setShapes((prev) => prev.filter((_, index) => !localShapeIndices.includes(index)));
        setUnsavedShapes((prev) => prev.filter((_, index) => !localShapeIndices.includes(index)));
      }

      // Add database markups to pending deletes and hide them locally
      if (dbMarkupIds.length > 0) {
        setPendingDeletes((prev) => [...prev, ...dbMarkupIds]);
        // Hide deleted markups from view by removing from local markup list
        dbMarkupIds.forEach(id => onMarkupDeleted(id));
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
      setUnsavedPaths((prev) => [...prev, pathData]);
      setHistory((prev) => [...prev, pathData]);
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
        visitorName: isOwner ? null : 'You',
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
      setUnsavedShapes((prev) => [...prev, shapeData]);
      updateSaveStatus('unsaved');

      // Add temporary markup to activity log
      const tempMarkup = {
        id: `temp-${Date.now()}`,
        type: activeTool === 'highlight' ? 'HIGHLIGHT' : 'SHAPE',
        color,
        strokeWidth,
        createdAt: new Date().toISOString(),
        userId: isOwner ? 'current-user' : null,
        visitorName: isOwner ? null : 'You',
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
    if (unsavedPaths.length === 0 && unsavedShapes.length === 0 && pendingDeletes.length === 0) return;

    setIsSaving(true);
    updateSaveStatus('saving');

    try {
      // Delete all pending markups in parallel
      const deletePromises = pendingDeletes.map(async (markupId) => {
        const response = await fetcher({
          url: API_PROJECT_CHECKPOINT_MARKUPS_DELETE_ROUTE,
          requestBody: { markupId }
        });

        if (response.err) {
          throw new Error('Failed to delete markup');
        }

        return markupId;
      });

      // Save all unsaved paths in parallel
      const pathPromises = unsavedPaths.map(async (pathData) => {
        const response = await fetcher({
          url: API_PROJECT_CHECKPOINT_MARKUPS_CREATE_ROUTE,
          requestBody: {
            attachmentId: attachment.id,
            type: pathData.isHighlight ? 'HIGHLIGHT' : 'DRAWING',
            canvasData: pathData,
            color: pathData.color,
            strokeWidth: pathData.width
          }
        });

        if (response.err) {
          throw new Error('Failed to save markup');
        }

        return response.content;
      });

      // Save all unsaved shapes in parallel
      const shapePromises = unsavedShapes.map(async (shapeData) => {
        const response = await fetcher({
          url: API_PROJECT_CHECKPOINT_MARKUPS_CREATE_ROUTE,
          requestBody: {
            attachmentId: attachment.id,
            type: shapeData.type === 'highlight' ? 'HIGHLIGHT' : 'SHAPE',
            canvasData: {
              shapeType: shapeData.type,
              start: shapeData.start,
              end: shapeData.end
            },
            color: shapeData.color,
            strokeWidth: shapeData.width
          }
        });

        if (response.err) {
          throw new Error('Failed to save shape');
        }

        return response.content;
      });

      // Execute all operations in parallel
      const [deletedIds, ...savedMarkups] = await Promise.all([
        Promise.all(deletePromises),
        Promise.all(pathPromises),
        Promise.all(shapePromises)
      ]);

      // Flatten saved markups
      const allSavedMarkups = savedMarkups.flat();

      // Update paths with IDs from server
      setPaths((prev) => {
        const newPaths = [...prev];
        allSavedMarkups.slice(0, unsavedPaths.length).forEach((markup, index) => {
          const pathIndex = newPaths.length - unsavedPaths.length + index;
          if (newPaths[pathIndex]) {
            newPaths[pathIndex] = { ...newPaths[pathIndex], id: markup.id };
          }
        });
        return newPaths;
      });

      // Update shapes with IDs from server
      setShapes((prev) => {
        const newShapes = [...prev];
        allSavedMarkups.slice(unsavedPaths.length).forEach((markup, index) => {
          const shapeIndex = newShapes.length - unsavedShapes.length + index;
          if (newShapes[shapeIndex]) {
            newShapes[shapeIndex] = { ...newShapes[shapeIndex], id: markup.id };
          }
        });
        return newShapes;
      });

      // Clear unsaved items and pending deletes
      setUnsavedPaths([]);
      setUnsavedShapes([]);
      setPendingDeletes([]);
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

    const lastPath = history[history.length - 1];

    // Remove from history and add to redo stack
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastPath]);

    // Remove from paths
    setPaths((prev) => prev.slice(0, -1));

    // Find and remove the last DRAWING markup from activity log
    const drawingMarkups = markups.filter((m) => m.type === 'DRAWING');
    if (drawingMarkups.length > 0) {
      const lastDrawingMarkup = drawingMarkups[drawingMarkups.length - 1];
      onMarkupDeleted(lastDrawingMarkup.id);
    }

    // If it was unsaved, remove from unsaved paths
    setUnsavedPaths((prev) => {
      const index = prev.findIndex((p) => p === lastPath);
      if (index !== -1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });

    redrawCanvas();
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const pathToRedo = redoStack[redoStack.length - 1];

    // Remove from redo stack and add back to history
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, pathToRedo]);

    // Add back to paths
    setPaths((prev) => [...prev, pathToRedo]);

    // Add temporary markup back to activity log
    const tempMarkup = {
      id: `temp-${Date.now()}`,
      type: 'DRAWING',
      color: pathToRedo.color,
      strokeWidth: pathToRedo.width,
      createdAt: new Date().toISOString(),
      userId: isOwner ? 'current-user' : null,
      visitorName: isOwner ? null : 'You',
      canvasData: pathToRedo,
      comments: []
    };
    onMarkupCreated(tempMarkup);

    // Mark as unsaved
    setUnsavedPaths((prev) => [...prev, pathToRedo]);
    updateSaveStatus('unsaved');
    scheduleDebouncedSave();

    redrawCanvas();
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
      setShapes([]);
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
              className={`absolute inset-0 ${fileType === 'pdf' ? 'bg-transparent' : 'bg-muted'} ${['draw', 'comment', 'highlight', 'rectangle', 'circle', 'arrow'].includes(activeTool) ? 'cursor-crosshair' : activeTool === 'eraser' ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ pointerEvents: ['select', 'draw', 'comment', 'highlight', 'rectangle', 'circle', 'arrow', 'eraser'].includes(activeTool) ? 'auto' : 'none' }}
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
                <div className="text-xs font-semibold text-foreground mb-1">{hoveredComment.userId ? 'You' : hoveredComment.visitorName || 'Anonymous'}</div>
                <div className="text-xs text-muted-foreground">{hoveredComment.comments[0].text}</div>
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
