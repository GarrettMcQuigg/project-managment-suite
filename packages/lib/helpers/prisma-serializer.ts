/**
 * Utility to serialize Prisma objects containing Decimal values for use in client components
 */

import { Prisma } from "@prisma/client";

/**
 * Recursively serializes all Decimal values in an object to strings or numbers
 * @param obj - The object potentially containing Decimal values
 * @returns - A new object with all Decimal values converted to numbers
 */
export function serializePrismaObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Prisma.Decimal) {
    // Convert Decimal to a number
    return Number(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializePrismaObject) as unknown as T;
  }

  // Process object properties
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = serializePrismaObject(value);
  }

  return result as T;
}
