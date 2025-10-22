'use client';

import React, { useState } from 'react';
import {
  MousePointer2,
  MessageSquare,
  Pencil,
  Highlighter,
  Square,
  Circle,
  ArrowRight,
  Undo,
  Trash2
} from 'lucide-react';

type ToolType = 'select' | 'comment' | 'draw' | 'highlight' | 'rectangle' | 'circle' | 'arrow';

interface CanvasToolbarProps {
  activeTool: ToolType;
  color: string;
  strokeWidth: number;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onClearAll: () => void;
}

export default function CanvasToolbar({
  activeTool,
  color,
  strokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onClearAll
}: CanvasToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const tools = [
    { id: 'select' as ToolType, icon: MousePointer2, label: 'Select' },
    { id: 'comment' as ToolType, icon: MessageSquare, label: 'Comment' },
    { id: 'draw' as ToolType, icon: Pencil, label: 'Draw' },
    { id: 'highlight' as ToolType, icon: Highlighter, label: 'Highlight' },
    { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle' },
    { id: 'circle' as ToolType, icon: Circle, label: 'Circle' },
    { id: 'arrow' as ToolType, icon: ArrowRight, label: 'Arrow' }
  ];

  const presetColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#000000', '#FFFFFF', '#808080', '#FFC0CB'
  ];

  return (
    <div className="border-b border-border bg-card p-3 flex items-center gap-3 flex-wrap">
      {/* Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`p-2 rounded-lg transition-colors ${
                activeTool === tool.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={tool.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-2 border-r border-border pr-3">
        <span className="text-sm text-muted-foreground">Color:</span>
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors"
            style={{ backgroundColor: color }}
          />
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <div
                className="fixed inset-0"
                onClick={() => setShowColorPicker(false)}
              />
              <div className="relative bg-card border border-border rounded-lg shadow-lg p-3">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {presetColors.map((presetColor) => (
                    <button
                      key={presetColor}
                      onClick={() => {
                        onColorChange(presetColor);
                        setShowColorPicker(false);
                      }}
                      className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors"
                      style={{ backgroundColor: presetColor }}
                      title={presetColor}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-24 px-2 py-1 text-xs border border-border rounded bg-background"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-2 border-r border-border pr-3">
        <span className="text-sm text-muted-foreground">Width:</span>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-sm text-muted-foreground w-6">{strokeWidth}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={onClearAll}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          title="Clear All"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
