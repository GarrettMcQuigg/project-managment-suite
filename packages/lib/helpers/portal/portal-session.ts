import { PortalSession } from '@prisma/client';
import { db } from '../../prisma/client';

export const PORTAL_SESSION_COOKIE = 'portal_session_id';

/**
 * Creates a new portal session for a visitor
 */
export async function createPortalSession(params: {
  projectId: string;
  visitorName: string;
  ipAddress?: string;
  userAgent?: string;
  expiresInHours?: number;
}): Promise<PortalSession> {
  const { projectId, visitorName, ipAddress, userAgent, expiresInHours = 24 } = params;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const session = await db.portalSession.create({
    data: {
      projectId,
      visitorName,
      ipAddress,
      userAgent,
      expiresAt
    }
  });

  return session;
}

/**
 * Validates a portal session by ID
 * Returns the session if valid, null if expired or not found
 */
export async function validatePortalSession(sessionId: string): Promise<PortalSession | null> {
  if (!sessionId) {
    return null;
  }

  const session = await db.portalSession.findFirst({
    where: {
      id: sessionId,
      expiresAt: { gt: new Date() }
    }
  });

  if (session) {
    // Update last accessed timestamp
    await db.portalSession.update({
      where: { id: sessionId },
      data: { lastAccessedAt: new Date() }
    });
  }

  return session;
}

/**
 * Validates a portal session and checks if it matches the given project
 */
export async function validatePortalSessionForProject(sessionId: string, projectId: string): Promise<PortalSession | null> {
  if (!sessionId || !projectId) {
    return null;
  }

  const session = await db.portalSession.findFirst({
    where: {
      id: sessionId,
      projectId,
      expiresAt: { gt: new Date() }
    }
  });

  if (session) {
    // Update last accessed timestamp
    await db.portalSession.update({
      where: { id: sessionId },
      data: { lastAccessedAt: new Date() }
    });
  }

  return session;
}

/**
 * Deletes/revokes a portal session
 */
export async function revokePortalSession(sessionId: string): Promise<void> {
  await db.portalSession.delete({
    where: { id: sessionId }
  });
}

/**
 * Deletes all expired portal sessions (cleanup job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db.portalSession.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });

  return result.count;
}

/**
 * Gets all active sessions for a project
 */
export async function getActiveSessionsForProject(projectId: string): Promise<PortalSession[]> {
  return db.portalSession.findMany({
    where: {
      projectId,
      expiresAt: { gt: new Date() }
    },
    orderBy: {
      lastAccessedAt: 'desc'
    }
  });
}

/**
 * Extends a portal session expiration time
 */
export async function extendPortalSession(sessionId: string, additionalHours: number = 24): Promise<PortalSession | null> {
  const session = await db.portalSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    return null;
  }

  const newExpiresAt = new Date(session.expiresAt);
  newExpiresAt.setHours(newExpiresAt.getHours() + additionalHours);

  return db.portalSession.update({
    where: { id: sessionId },
    data: { expiresAt: newExpiresAt }
  });
}
