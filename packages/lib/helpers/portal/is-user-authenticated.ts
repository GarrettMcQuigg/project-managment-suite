import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '../../constants/cookie-keys';
import { NextRequest } from 'next/server';

export function isUserAuthenticated(request: NextRequest): boolean {
  const tokenCookie = request.cookies.get(TOKEN_COOKIE_KEY);
  const userCookie = request.cookies.get(USER_COOKIE_KEY);

  if (!tokenCookie?.value || !userCookie?.value || userCookie.value === 'undefined') {
    return false;
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable not set');
    return false;
  }

  try {
    // Parse JWT payload (base64 decode the middle part)
    const parts = tokenCookie.value.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }

    if (!payload.userId) {
      return false;
    }

    // Check user cookie structure
    const user = JSON.parse(userCookie.value);
    if (!user.id || !user.email) {
      return false;
    }

    // Verify the user ID in the token matches the user cookie
    if (payload.userId !== user.id) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}
