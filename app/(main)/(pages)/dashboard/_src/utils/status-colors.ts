import { ProjectStatus } from '@prisma/client';

// Status color mapping for consistent colors across components
export const statusColors: Record<ProjectStatus, string> = {
  ACTIVE: '#6366f1', // Indigo
  COMPLETED: '#10b981', // Green
  PAUSED: '#f59e0b', // Amber
  PREPARATION: '#8b5cf6', // Purple
  DRAFT: '#fffb00', // Yellow
  ARCHIVED: '#6b7280', // Gray
  DELETED: '#ef4444' // Red
} as Record<ProjectStatus, string>;
