'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Crown, ArrowLeft, Eye, MoonIcon, SunIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PortalHeaderProps {
  projectStatus: string;
  isOwner: boolean;
}

export default function PortalHeader({ projectStatus, isOwner }: PortalHeaderProps) {
  const router = useRouter();
  // TODO : Implement preview mode
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // const [previewMode, setPreviewMode] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // const handleToggleView = () => {
  //   if (isOwner) {
  //     const newPreviewMode = !previewMode;
  //     setPreviewMode(newPreviewMode);

  //     const url =
  //       routeWithParam(PROJECT_PORTAL_ROUTE, {
  //         id: project.id,
  //         portalSlug: portalSlug
  //       }) + (newPreviewMode ? '?preview=true' : '');

  //     router.push(url);
  //   }
  // };

  // const viewText = isOwner ? (previewMode ? 'Client View Preview' : 'Owner View') : 'Client Portal';

  return (
    <header className="z-50">
      <div className="container mx-auto py-4 lg:px-12 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="block xs:hidden p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
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

          <div className="flex items-center space-x-4">
            <div
              className={`hidden xs:block px-3 py-1.5 rounded-full text-xs font-medium border ${
                projectStatus === 'ACTIVE' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {projectStatus}
            </div>

            {isOwner && (
              <div className="hidden xs:flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                <Eye className="h-3 w-3" />
                <span>Owner View</span>
              </div>
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
