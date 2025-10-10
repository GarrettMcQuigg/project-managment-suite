'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Crown, ArrowLeft, Eye, MoonIcon, SunIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { routeWithParam } from '@/packages/lib/routes';
import { PROJECT_PORTAL_ROUTE } from '@/packages/lib/routes';
import { Button } from '@/packages/lib/components/button';

interface PortalHeaderProps {
  projectStatus: string;
  isOwner: boolean;
  projectId: string;
  portalSlug: string;
}

export default function PortalHeader({ projectStatus, isOwner, projectId, portalSlug }: PortalHeaderProps) {
  const router = useRouter();
  // TODO : Implement preview mode
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleView = () => {
    if (isOwner) {
      const newPreviewMode = !previewMode;
      setPreviewMode(newPreviewMode);

      const url =
        routeWithParam(PROJECT_PORTAL_ROUTE, {
          id: projectId,
          portalSlug: portalSlug
        }) + (newPreviewMode ? '?preview=true' : '');

      router.push(url);
    }
  };

  // const viewText = isOwner ? (previewMode ? 'Client View Preview' : 'Owner View') : 'Client Portal';

  return (
    <header className="z-50">
      <div className="container mx-auto py-4 lg:px-16 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isOwner && (
              <button onClick={() => router.back()} className="block xs:hidden p-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Solira Portal</h1>
                {/* <p className="text-sm text-muted-foreground">Welcome back, {isOwner ? project.user.name : visitorName}</p> */}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {isOwner && (
              <Button
                onClick={handleToggleView}
                variant="outline"
                className={`md:flex hidden ${previewMode ? 'bg-red-500 text-white hover:text-white hover:bg-red-500/90 ' : 'bg-primary text-white hover:text-white hover:bg-primary/90'}`}
              >
                <Eye className="h-3 w-3" />
                <span>{previewMode ? 'Client View' : 'Owner View'}</span>
              </Button>
            )}

            {mounted && (
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <MoonIcon className="h-5 w-5 text-foreground hover:text-muted-foreground transition-colors" />
                ) : (
                  <SunIcon className="h-5 w-5 text-foreground hover:text-muted-foreground transition-colors" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
