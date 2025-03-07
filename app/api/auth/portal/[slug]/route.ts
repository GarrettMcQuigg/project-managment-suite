// app/api/auth/portal/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { handleError } from '@/packages/lib/helpers/api-response-handlers';
import { compare } from 'bcrypt';
import { TOKEN_COOKIE_KEY } from '@/packages/lib/constants/cookie-keys';
import { DASHBOARD_ROUTE, ROOT_ROUTE } from '@/packages/lib/routes';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get('redirect') || '/';

  try {
    // First check if the portal exists
    const project = await db.project.findUnique({
      where: {
        portalSlug: slug,
        portalEnabled: true
      }
    });

    // If the portal doesn't exist, redirect based on authentication status
    if (!project) {
      const tokenCookie = request.cookies.get(TOKEN_COOKIE_KEY);

      if (tokenCookie) {
        // User is authenticated, redirect to dashboard
        return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url));
      } else {
        // User is not authenticated, redirect to root
        return NextResponse.redirect(new URL(ROOT_ROUTE, request.url));
      }
    }

    // Portal exists, show the password form
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Project Portal Authentication</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            form {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              width: 100%;
              max-width: 400px;
            }
            h1 {
              margin-top: 0;
              color: #333;
            }
            input {
              width: 100%;
              padding: 0.75rem;
              margin-bottom: 1rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 1rem;
            }
            button {
              background: #0070f3;
              color: white;
              border: none;
              padding: 0.75rem 1rem;
              border-radius: 4px;
              font-size: 1rem;
              cursor: pointer;
              width: 100%;
            }
            .error {
              color: #e00;
              margin-bottom: 1rem;
            }
            .field-error {
              color: #e00;
              font-size: 0.875rem;
              margin-top: -0.5rem;
              margin-bottom: 1rem;
              display: none;
            }
          </style>
        </head>
        <body>
          <form method="POST">
            <h1>Project Portal Access</h1>
            <p>Please enter your name and the password to access this project portal.</p>
            <div id="error-message" class="error" style="display: none;"></div>
            
            <input type="text" name="visitorName" placeholder="Your Name" required minlength="3" />
            <div id="name-error" class="field-error">Name must be at least 3 characters long</div>
            
            <input type="password" name="password" placeholder="Password" required />
            <input type="hidden" name="redirect" value="${redirectUrl}" />
            <input type="hidden" name="slug" value="${slug}" />
            <button type="submit">Access Portal</button>
          </form>
          <script>
            const nameInput = document.querySelector('input[name="visitorName"]');
            const nameError = document.getElementById('name-error');
            
            nameInput.addEventListener('input', () => {
              if (nameInput.value.length < 3) {
                nameError.style.display = 'block';
              } else {
                nameError.style.display = 'none';
              }
            });
            
            document.querySelector('form').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const visitorName = nameInput.value;
              if (visitorName.length < 3) {
                nameError.style.display = 'block';
                return;
              }
              
              const password = document.querySelector('input[name="password"]').value;
              const redirect = document.querySelector('input[name="redirect"]').value;
              const slug = document.querySelector('input[name="slug"]').value;
              
              const response = await fetch('/api/auth/portal/${slug}', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ visitorName, password, redirect }),
              });
              
              const data = await response.json();
              
              if (response.ok) {
                window.location.href = data.redirect;
              } else {
                const errorEl = document.getElementById('error-message');
                errorEl.textContent = data.error || 'Invalid password';
                errorEl.style.display = 'block';
              }
            });
          </script>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html'
        }
      }
    );
  } catch (error) {
    console.error('Error checking portal existence:', error);
    // On error, default to redirecting to home page
    return NextResponse.redirect(new URL(ROOT_ROUTE, request.url));
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const { visitorName, password, redirect } = await request.json();

  // Validate name length
  if (!visitorName || visitorName.length < 3) {
    return handleError({ message: 'Name must be at least 3 characters long' });
  }

  try {
    // Find the project by portal slug
    const project = await db.project.findUnique({
      where: {
        portalSlug: slug,
        portalEnabled: true
      },
      select: {
        id: true,
        portalPass: true,
        userId: true
      }
    });

    if (!project) {
      return handleError({ message: 'Project not found' });
    }

    const passwordValid = await compare(password, project.portalPass);
    if (!passwordValid) {
      return handleError({ message: 'Invalid password' });
    }

    // Record the portal view
    await db.portalView.create({
      data: {
        projectId: project.id,
        name: visitorName
      }
    });

    // Set the access cookie
    const response = NextResponse.json({ success: true, redirect }, { status: 200 });

    // Check if user is already logged in
    const tokenCookie = request.cookies.get(TOKEN_COOKIE_KEY);
    if (tokenCookie) {
      try {
        const tokenParts = tokenCookie.value.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

          if (payload.userId === project.userId) {
            response.cookies.set('project_owner', 'true', {
              httpOnly: true,
              maxAge: 60 * 60 * 24,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            });
          }
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }

    // Store the visitor name in a cookie so middleware can use it
    response.cookies.set(`portal_name_${slug}`, visitorName, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    // Set portal access cookie for everyone who provides correct password
    response.cookies.set(`portal_access_${slug}`, 'true', {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    console.error('Portal authentication error:', error);
    return handleError({ message: 'Failed to authenticate portal' });
  }
}
