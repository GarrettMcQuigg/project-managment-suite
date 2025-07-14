'use client';

import { Calendar, Plus, LayoutDashboard, FolderKanban, Users, Settings, Receipt, Trello, LucideIcon } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/packages/lib/components/button';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { toast } from 'react-toastify';
import {
  API_PROJECT_ADD_ROUTE,
  CLIENTS_ROUTE,
  DASHBOARD_ROUTE,
  PROJECTS_ROUTE,
  CALENDAR_ROUTE,
  SETTINGS_ROUTE,
  SUPPORT_ROUTE,
  PROJECT_BOARD_ROUTE,
  INVOICES_ROUTE,
  API_PROJECT_LIST_ROUTE
} from '@/packages/lib/routes';
import UnifiedProjectWorkflow from './project-workflow-dialog';
import { ProjectFormData } from './components/project-step';
import { Phase, Invoice } from '@prisma/client';
import { mutate } from 'swr';

export function AppSidebar({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleComplete = async (data: ProjectFormData & { phases: Phase[]; invoices: Invoice[] }) => {
    setLoading(true);
    try {
      const response = await fetcher({
        url: API_PROJECT_ADD_ROUTE,
        requestBody: data
      });

      if (response.err) {
        toast.error('Failed to create project');
        setLoading(false);
        return;
      }

      toast.success('Project created successfully');

      setResetTrigger((prev) => prev + 1);

      setIsOpen(false);

      router.refresh();
      mutate(API_PROJECT_LIST_ROUTE);
      router.push(PROJECTS_ROUTE);
      setSidebarOpen(false);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
      setLoading(false);
    }
  };

  const renderMenuItem = (href: string, icon: LucideIcon, label: string) => {
    const isActive = pathname === href;
    const Icon = icon;

    const handleClick = () => {
      setSidebarOpen(false);
    };

    return (
      <li className="mb-1">
        <Link href={href} onClick={handleClick}>
          <div
            className={`flex w-full items-center p-2 text-sm transition-all duration-200 ${
              isActive
                ? 'text-primary dark:text-white font-medium'
                : 'text-muted-foreground hover:text-primary dark:hover:text-white'
            }`}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </div>
        </Link>
      </li>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full w-full border-r border-border dark:border-white/[0.08] bg-white dark:bg-[#0a1a1a]">
        {/* Header */}
        <div className="p-4 h-header shrink-0 flex items-center">
          <Button onClick={() => setIsOpen(true)} disabled={loading} className="transition-all duration-300 group/button min-w-44">
            <div>New Project</div>
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" />
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex flex-col px-4 flex-grow overflow-y-auto space-y-6 mt-4">
          {/* MAIN Section */}
          <div className="my-4">
            <div className="mb-2 text-xs font-medium text-foreground/70 dark:text-white/90">MAIN</div>
            <ul className="space-y-1">
              {renderMenuItem(DASHBOARD_ROUTE, LayoutDashboard, 'Dashboard')}
              {renderMenuItem(PROJECTS_ROUTE, FolderKanban, 'Projects')}
              {renderMenuItem(CLIENTS_ROUTE, Users, 'Clients')}
              {renderMenuItem(INVOICES_ROUTE, Receipt, 'Invoices')}
            </ul>
          </div>

          {/* UTILITIES Section */}
          <div className="mb-6">
            <div className="mb-2 text-xs font-medium text-foreground/70 dark:text-white/90">UTILITIES</div>
            <ul>
              {renderMenuItem(CALENDAR_ROUTE, Calendar, 'Calendar')}
              {renderMenuItem(PROJECT_BOARD_ROUTE, Trello, 'Project Board')}
            </ul>
          </div>
        </div>

        {/* Bottom Section - Fixed at bottom */}
        <div className="mt-auto px-4 py-4 border-t border-border/30 dark:border-white/[0.08]">
          <ul>
            {renderMenuItem(SUPPORT_ROUTE, Users, 'Support')}
            {renderMenuItem(SETTINGS_ROUTE, Settings, 'Settings')}
          </ul>
        </div>
      </div>

      {/* Project Creation Modal */}
      <UnifiedProjectWorkflow open={isOpen} onOpenChange={setIsOpen} onComplete={handleComplete} resetTrigger={resetTrigger} />
    </>
  );
}
