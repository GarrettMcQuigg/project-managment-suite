'use client';

import { Calendar, Plus, LayoutDashboard, FolderKanban, Users, Settings, Receipt, Trello } from 'lucide-react';
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
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
      setLoading(false);
    }
  };

  const renderMenuItem = (href: string, icon: any, label: string) => {
    const isActive = pathname === href;
    const Icon = icon;

    const handleClick = () => {
      setSidebarOpen(false);
    };

    return (
      <li className="mb-1">
        <Link href={href} onClick={handleClick}>
          <div
            className={`flex w-full items-center rounded-lg p-2 text-sm transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white font-medium'
                : 'text-muted-foreground hover:bg-primary/5 hover:text-primary dark:hover:bg-white/[0.06] dark:hover:text-white'
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
      <div className="flex flex-col h-full w-full border-r border-border dark:border-white/[0.08] bg-gradient-to-b from-[#e8f7f7] to-white dark:from-[#021111] dark:to-black">
        {/* Header */}
        <div className="border-b border-border dark:border-white/[0.08] p-4 h-header shrink-0">
          <Button onClick={() => setIsOpen(true)} disabled={loading} className="transition-all duration-300 group/button lg:w-full">
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" />
            New Project
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex flex-col px-2 flex-grow overflow-y-auto space-y-6">
          {/* MAIN Section */}
          <div className="my-4">
            <div className="px-2 mb-2 text-xs font-medium text-foreground/70 dark:text-white/90">MAIN</div>
            <ul className="space-y-1">
              {renderMenuItem(DASHBOARD_ROUTE, LayoutDashboard, 'Dashboard')}
              {renderMenuItem(PROJECTS_ROUTE, FolderKanban, 'Projects')}
              {renderMenuItem(CLIENTS_ROUTE, Users, 'Clients')}
              {renderMenuItem(INVOICES_ROUTE, Receipt, 'Invoices')}
            </ul>
          </div>

          {/* UTILITIES Section */}
          <div className="mb-6">
            <div className="px-2 mb-2 text-xs font-medium text-foreground/70 dark:text-white/90">UTILITIES</div>
            <ul>
              {renderMenuItem(CALENDAR_ROUTE, Calendar, 'Calendar')}
              {renderMenuItem(PROJECT_BOARD_ROUTE, Trello, 'Project Board')}
            </ul>
          </div>
        </div>

        {/* Bottom Section - Fixed at bottom */}
        <div className="mt-auto px-2 pb-4">
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
