// app/api/auth/portal/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { handleError } from '@/packages/lib/helpers/api-response-handlers';
import { compare } from 'bcrypt';
import { TOKEN_COOKIE_KEY } from '@/packages/lib/constants/cookie-keys';
import { DASHBOARD_ROUTE, ROOT_ROUTE } from '@/packages/lib/routes';
import { createPortalSession, PORTAL_SESSION_COOKIE } from '@/packages/lib/helpers/portal/portal-session';
import { generateUniquePortalId } from '@/packages/lib/helpers/portal/password-generator';

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
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              min-height: 100vh;
              position: relative;
            }
            
            /* Landing Background Styles */
            .landing-background {
              position: absolute;
              inset: 0;
              z-index: -10;
              overflow: hidden;
              background: hsl(var(--background));
            }
            
            .gradient-backdrop {
              position: absolute;
              inset: 0;
              opacity: 0.3;
              background: radial-gradient(ellipse at top left, rgba(24, 178, 170, 0.05) 0%, transparent 50%);
            }
            
            .geometric-grid {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
            }
            
            /* Form container styling similar to auth signin */
            .form-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 3rem 1rem;
            }
            
            .form-wrapper {
              max-width: 28rem;
              width: 100%;
              margin-top: -4rem;
              padding: 2rem 1rem;
            }
            
            .form-content {
              margin-top: 1.5rem;
              padding: 0;
              background: transparent;
              border: none;
              border-radius: 0;
              box-shadow: none;
            }
            
            h1 {
              margin: 1.5rem 0 1.5rem 0;
              text-align: center;
              font-size: 1.875rem;
              font-weight: 700;
              color: #1f2937;
              line-height: 1.2;
            }
            
            p {
              text-align: center;
              color: #6b7280;
              margin-bottom: 2rem;
              font-size: 0.875rem;
            }
            
            .form-group {
              margin-bottom: 1rem;
            }
            
            label {
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: #374151;
              margin-bottom: 0.5rem;
            }
            
            input[type="text"], input[type="password"] {
              width: 100%;
              padding: 0.75rem 1rem;
              border: 1px solid rgba(209, 213, 219, 0.2);
              border-radius: 0.375rem;
              font-size: 1rem;
              background: #ffffff;
              color: #1f2937;
              box-sizing: border-box;
              ring: 1px solid rgba(55, 65, 81, 0.1);
              transition: all 0.15s ease-in-out;
            }
            
            input[type="text"]:focus, input[type="password"]:focus {
              outline: none;
              ring: 2px solid rgba(139, 92, 246, 0.5);
              border-color: rgba(139, 92, 246, 0.5);
            }
            
            button {
              width: 100%;
              background: #14b8a6 !important;
              color: #ffffff !important;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              font-size: 0.875rem;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.15s ease-in-out;
              height: 2.25rem;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              white-space: nowrap;
            }
            
            button:hover {
              background: #0f766e !important;
            }
            
            button:focus-visible {
              outline: none;
              ring: 1px solid hsl(175 90% 35%);
              box-shadow: 0 0 0 1px hsl(175 90% 35%);
            }
            
            button:disabled {
              pointer-events: none;
              opacity: 0.5;
            }
            
            .error {
              color: #dc2626;
              background: rgba(220, 38, 38, 0.1);
              border: 1px solid rgba(220, 38, 38, 0.2);
              border-radius: 0.375rem;
              padding: 0.75rem;
              margin-bottom: 1rem;
              font-size: 0.875rem;
              display: none;
            }
            
            .field-error {
              color: #dc2626;
              font-size: 0.875rem;
              margin-top: 0.25rem;
              display: none;
            }
            
            @keyframes gridDrift {
              0%, 100% { 
                transform: translateX(0px) translateY(0px);
              }
              50% { 
                transform: translateX(5px) translateY(-3px);
              }
            }
          </style>
        </head>
        <body>
          <!-- Landing Background -->
          <div class="landing-background">
            <div class="gradient-backdrop"></div>
            <svg class="geometric-grid" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gridWithFilledSquares" x="0" y="0" width="1200" height="1200" patternUnits="userSpaceOnUse">
                  <path
                    d="M0,120 L1200,120 M0,240 L1200,240 M0,360 L1200,360 M0,480 L1200,480 M0,600 L1200,600 M0,720 L1200,720 M0,840 L1200,840 M0,960 L1200,960 M0,1080 L1200,1080"
                    stroke="rgba(190, 202, 202, 0.25)"
                    stroke-width="1"
                    fill="none"
                  />
                  <path
                    d="M120,0 L120,1200 M240,0 L240,1200 M360,0 L360,1200 M480,0 L480,1200 M600,0 L600,1200 M720,0 L720,1200 M840,0 L840,1200 M960,0 L960,1200 M1080,0 L1080,1200"
                    stroke="rgba(190, 202, 202, 0.25)"
                    stroke-width="1"
                    fill="none"
                  />
                  <rect x="0" y="0" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="360" y="120" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="840" y="120" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="120" y="360" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="600" y="360" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="240" y="600" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="960" y="600" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="480" y="840" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="720" y="960" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                  <rect x="1080" y="1080" width="120" height="120" fill="rgba(180, 180, 180, 0.12)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridWithFilledSquares)" style="animation: gridDrift 18s ease-in-out infinite;" />
            </svg>
          </div>
          
          <div class="form-container">
            <div class="form-wrapper">
              <div class="form-content">
                <h1 class="text-2xl font-bold">Project Portal Access</h1>
                <p class="text-sm text-muted-foreground mt-2">Please enter your name and the portal password to access this project portal.</p>
                
                <div id="error-message" class="error"></div>
                
                <form method="POST">
                  <div class="form-group">
                    <label for="visitorName">Your Name</label>
                    <input type="text" id="visitorName" name="visitorName" placeholder="Enter your name" class="border border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2  focus:border-violet-500 dark:focus:border-violet-400" required minlength="3" />
                    <div id="name-error" class="field-error">Name must be at least 3 characters long</div>
                  </div>
                  
                  <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter portal password" class="border border-gray-200/20 dark:border-gray-700/50 ring-1 ring-gray-700/10 dark:ring-gray-200/10 focus:ring-2  focus:border-violet-500 dark:focus:border-violet-400" required />
                  </div>
                  
                  <input type="hidden" name="redirect" value="${redirectUrl}" />
                  <input type="hidden" name="slug" value="${slug}" />
                  
                  <div style="margin-top: 1.5rem;">
                    <button type="submit" id="submit-btn">Access Portal</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <script>
            const nameInput = document.querySelector('input[name="visitorName"]');
            const nameError = document.getElementById('name-error');
            const submitBtn = document.getElementById('submit-btn');
            
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
              
              // Show loading state
              submitBtn.disabled = true;
              submitBtn.textContent = 'Accessing...';
              
              const password = document.querySelector('input[name="password"]').value;
              const redirect = document.querySelector('input[name="redirect"]').value;
              const slug = document.querySelector('input[name="slug"]').value;
              
              try {
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
                  
                  // Reset button
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Access Portal';
                }
              } catch (error) {
                const errorEl = document.getElementById('error-message');
                errorEl.textContent = 'An error occurred. Please try again.';
                errorEl.style.display = 'block';
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Access Portal';
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

  if (!visitorName || visitorName.length < 3) {
    return handleError({ message: 'Name must be at least 3 characters long' });
  }

  try {
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

    await db.portalView.create({
      data: {
        projectId: project.id,
        name: visitorName
      }
    });

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    const session = await createPortalSession({
      projectId: project.id,
      visitorName,
      ipAddress,
      userAgent,
      expiresInHours: 24
    });

    const response = NextResponse.json({ success: true, redirect }, { status: 200 });
    response.cookies.set(PORTAL_SESSION_COOKIE, session.id, {
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
