'use client';

import { Button } from '@/packages/lib/components/button';
import { ProjectStatus } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from 'lucide-react';
import { PROJECT_PORTAL_ROUTE, routeWithParam } from '@/packages/lib/routes';

interface PortalHeaderProps {
  projectStatus: ProjectStatus;
  isOwner: boolean;
  visitorName: string;
  projectId: string;
  portalSlug: string;
}

const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PREPARATION: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/40 dark:text-yellow-300',
  ACTIVE: 'bg-blue-200 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300',
  PAUSED: 'bg-orange-200 text-orange-800 dark:bg-orange-800/40 dark:text-orange-300',
  COMPLETED: 'bg-green-200 text-green-800 dark:bg-green-800/40 dark:text-green-300',
  ARCHIVED: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  DELETED: 'bg-red-200 text-red-800 dark:bg-red-800/40 dark:text-red-300'
};

export default function PortalHeader({ projectStatus, isOwner, visitorName, projectId, portalSlug }: PortalHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const [previewMode, setPreviewMode] = useState<boolean>(isPreview);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  const viewText = isOwner ? (previewMode ? 'Client View Preview' : 'Owner View') : 'Client Portal';

  return (
    <div className="container mx-auto px-4 py-6 lg:w-3/4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Solira Portal</h1>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[projectStatus]}`}>{projectStatus.replace('_', ' ')}</div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            {isOwner ? (
              <Button variant="outline" onClick={handleToggleView}>
                <div className={`h-2 w-2 rounded-full ${!previewMode ? 'bg-emerald-500 dark:bg-[#00b894]' : 'bg-red-500/80 dark:bg-red-400'}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">{viewText}</span>
              </Button>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{viewText}</span>
              </>
            )}
          </div>

          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400 mr-2">Viewing as:</span>
            <span className="font-medium">{visitorName}</span>
          </div>

          {mounted && (
            <button
              type="button"
              className="bg-transparent cursor-pointer"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="transition-all duration-200 hover:scale-110">
                {theme === 'dark' ? (
                  <MoonIcon className="h-5 w-5 text-white hover:text-gray-200 transition-colors duration-200" aria-hidden="true" />
                ) : (
                  <SunIcon className="h-5 w-5 text-black hover:text-gray-800 transition-colors duration-200" aria-hidden="true" />
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
