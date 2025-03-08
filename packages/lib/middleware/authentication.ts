import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Middleware to protect API routes, requiring authentication
 */
export function withAuthentication(handler: RouteHandler): RouteHandler {
  return async function (req: NextRequest) {
    // Check if the user is authenticated
    const isAuthenticated = await isUserAuthenticated(req);

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
    }

    return handler(req);
  };
}

/**
 * Middleware to check if a user has access to a specific project
 * This allows both project owners and portal visitors with the correct access
 */
export function withProjectAccess(projectIdParam: string, handler: RouteHandler): RouteHandler {
  return async function (req: NextRequest) {
    // Extract project ID from URL or request body
    let projectId: string | null = null;

    // Try to get from URL params
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const paramIndex = parts.findIndex((part) => part === projectIdParam);

    if (paramIndex !== -1 && paramIndex < parts.length - 1) {
      projectId = parts[paramIndex + 1];
    }

    // If not found in URL, try to get from JSON body for POST/PUT requests
    if (!projectId && (req.method === 'POST' || req.method === 'PUT')) {
      try {
        const body = await req.clone().json();
        projectId = body[projectIdParam] || null;
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Bad Request', message: 'Project ID not provided' }, { status: 400 });
    }

    // Check if the user has access to this project
    const hasAccess = await checkProjectAccess(req, projectId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden', message: 'You do not have access to this project' }, { status: 403 });
    }

    return handler(req);
  };
}

/**
 * Check if a user has access to a specific project
 * This checks for both authenticated users who own the project
 * and portal visitors who have been granted access
 */
async function checkProjectAccess(req: NextRequest, projectId: string): Promise<boolean> {
  // Check if user is authenticated
  const isAuthenticated = await isUserAuthenticated(req);

  if (isAuthenticated) {
    // For authenticated users, check project ownership in the request handler
    // We can't verify ownership here because we need the database
    return true;
  }

  // For non-authenticated users, check if they have portal access
  const portalSlug = getProjectPortalSlug(projectId, req);

  if (!portalSlug) {
    return false;
  }

  // Check for portal access cookie
  const portalAccessCookie = req.cookies.get(`portal_access_${portalSlug}`);
  return !!portalAccessCookie;
}

/**
 * Helper to get a project's portal slug from the request
 * This is a simplification - in a real app, you might need to look this up in the database
 */
function getProjectPortalSlug(projectId: string, req: NextRequest): string | null {
  // This is just an example - in your real implementation,
  // you would need to get the portal slug from the database or request

  // Check for portal session cookie which might contain the slug
  const portalSessionCookie = req.cookies.get('portal_session');

  if (portalSessionCookie) {
    try {
      const session = JSON.parse(portalSessionCookie.value);
      if (session.projectId === projectId && session.slug) {
        return session.slug;
      }
    } catch (e) {
      // Ignore JSON parsing errors
    }
  }

  // If we can't determine the slug, return null
  return null;
}

/**
 * Helper to check if a user is authenticated
 */
async function isUserAuthenticated(req: NextRequest): Promise<boolean> {
  // Implementation from middleware.ts
  const tokenCookie = req.cookies.get('token');
  const userCookie = req.cookies.get('user');

  if (!tokenCookie?.value || !userCookie?.value || userCookie.value === 'undefined') {
    return false;
  }

  try {
    // Basic token validation
    const tokenParts = tokenCookie.value.split('.');
    if (tokenParts.length !== 3) {
      return false;
    }

    // Check user cookie structure
    const user = JSON.parse(userCookie.value);
    if (!user.id || !user.email) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}
