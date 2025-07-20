/**
 * Helper functions for serializing Prisma data for client components
 * Handles Decimal types and other non-serializable data types
 */

import { Analytics, CommunicationAnalytics, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AnalyticsWithMetadata } from '../prisma/types';

/**
 * Converts any Decimal values to numbers for JSON serialization
 * Useful when passing data from server components to client components
 */
export function serializeDecimal<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Decimal objects - multiple detection methods
  if (
    obj instanceof Decimal || 
    (obj as any)?.isDecimal === true ||
    // Detect Decimal by checking for constructor name and toFixed method
    ((obj as any)?.constructor?.name === 'Decimal' && typeof (obj as any)?.toFixed === 'function') ||
    // Check for Prisma's Decimal type
    ((obj as any)?._value !== undefined && (obj as any)?._precision !== undefined)
  ) {
    return Number(obj);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDecimal(item));
  }

  // Handle objects
  const serialized: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      serialized[key] = serializeDecimal((obj as any)[key]);
    }
  }
  return serialized;
}

/**
 * Serializes Analytics objects for client components
 */
export function serializeAnalytics(analytics: Analytics | AnalyticsWithMetadata | null): any {
  if (!analytics) return null;
  
  return serializeDecimal(analytics);
}

/**
 * Serializes User objects with related data for client components
 */
export function serializeUser(user: User | null | any): any {
  if (!user) return null;
  
  return serializeDecimal(user);
}

/**
 * Serializes any Prisma model for client components
 */
export function serializePrismaModel<T>(model: T): any {
  return serializeDecimal(model);
}
