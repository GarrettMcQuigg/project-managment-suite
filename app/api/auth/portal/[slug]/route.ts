// app/api/auth/portal/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { handleError } from '@/packages/lib/helpers/api-response-handlers';
import { compare } from 'bcrypt';
import { TOKEN_COOKIE_KEY } from '@/packages/lib/constants/cookie-keys';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get('redirect') || '/';

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
        </style>
      </head>
      <body>
        <form method="POST">
          <h1>Project Portal Access</h1>
          <p>Please enter the password to access this project portal.</p>
          <div id="error-message" class="error" style="display: none;"></div>
          <input type="password" name="password" placeholder="Password" required />
          <input type="hidden" name="redirect" value="${redirectUrl}" />
          <input type="hidden" name="slug" value="${slug}" />
          <button type="submit">Access Portal</button>
        </form>
        <script>
          document.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.querySelector('input[name="password"]').value;
            const redirect = document.querySelector('input[name="redirect"]').value;
            const slug = document.querySelector('input[name="slug"]').value;
            
            const response = await fetch('/api/auth/portal/${slug}', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ password, redirect }),
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
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const { password, redirect } = await request.json();

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
        userId: true // Add this to check project ownership
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
        projectId: project.id
      }
    });

    // Set the access cookie
    const response = NextResponse.json({ success: true, redirect }, { status: 200 });

    // Check if user is already logged in
    const tokenCookie = request.cookies.get(TOKEN_COOKIE_KEY);
    if (tokenCookie) {
      try {
        // Decode token to get userId (without verification, since we can't use verify in Edge)
        const tokenParts = tokenCookie.value.split('.');
        if (tokenParts.length === 3) {
          // Extract payload
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

          // If user owns this project, we'll set a special cookie
          if (payload.userId === project.userId) {
            // User owns the project, set a cookie indicating this
            response.cookies.set('project_owner', 'true', {
              httpOnly: true,
              maxAge: 60 * 60 * 24, // 24 hours
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            });
          }
        }
      } catch (e) {
        // Ignore token decoding errors
        console.error('Error decoding token:', e);
      }
    }

    // Set portal access cookie for everyone who provides correct password
    response.cookies.set(`portal_access_${slug}`, 'true', {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 24 hours
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
